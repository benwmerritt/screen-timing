import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import type { DashboardData, DailySummary, AppTotal, DeviceTotal, HourlyPattern, MonthlyTrend } from '../types'

// Time range presets
export type TimeRange = 'week' | '30d' | '90d' | 'year' | '2year' | '3year' | 'all'

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  week: '7 Days',
  '30d': '30 Days',
  '90d': '90 Days',
  year: '1 Year',
  '2year': '2 Years',
  '3year': '3 Years',
  all: 'All Time',
}

interface FilterState {
  timeRange: TimeRange
  devices: string[]
}

interface FilteredData {
  dailySummary: DailySummary[]
  appTotals: AppTotal[]
  deviceTotals: DeviceTotal[]
  hourlyPatterns: HourlyPattern[]
  monthlyTrends: MonthlyTrend[]
  totalSeconds: number
  totalDays: number
  activeDays: number
}

interface FilterContextType {
  filters: FilterState
  setTimeRange: (range: TimeRange) => void
  toggleDevice: (device: string) => void
  availableDevices: string[]
  filteredData: FilteredData | null
}

const FilterContext = createContext<FilterContextType | null>(null)

function getDateCutoff(range: TimeRange): Date | null {
  if (range === 'all') return null

  const now = new Date()
  switch (range) {
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case 'year':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    case '2year':
      return new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000)
    case '3year':
      return new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000)
    default:
      return null
  }
}

interface FilterProviderProps {
  children: ReactNode
  data: DashboardData
}

export function FilterProvider({ children, data }: FilterProviderProps) {
  // Get all unique devices from the data
  const availableDevices = useMemo(() => {
    return data.deviceTotals.map(d => d.device)
  }, [data.deviceTotals])

  const [filters, setFilters] = useState<FilterState>({
    timeRange: 'all',
    devices: availableDevices, // All devices selected by default
  })

  const setTimeRange = (range: TimeRange) => {
    setFilters(prev => ({ ...prev, timeRange: range }))
  }

  const toggleDevice = (device: string) => {
    setFilters(prev => ({
      ...prev,
      devices: prev.devices.includes(device)
        ? prev.devices.filter(d => d !== device)
        : [...prev.devices, device],
    }))
  }

  // Compute filtered data
  const filteredData = useMemo((): FilteredData => {
    const cutoffDate = getDateCutoff(filters.timeRange)
    const selectedDevices = new Set(filters.devices)

    // Filter daily summaries by date and recalculate device totals
    const filteredDaily = data.dailySummary
      .filter(day => {
        if (cutoffDate && new Date(day.date) < cutoffDate) return false
        return true
      })
      .map(day => {
        // Filter device breakdown
        const filteredDevices: Record<string, number> = {}
        let totalForDay = 0
        for (const [device, seconds] of Object.entries(day.devices)) {
          if (selectedDevices.has(device)) {
            filteredDevices[device] = seconds
            totalForDay += seconds
          }
        }
        return {
          ...day,
          devices: filteredDevices,
          totalSeconds: totalForDay,
        }
      })
      .filter(day => day.totalSeconds > 0) // Remove days with no activity after device filter

    // Recalculate app totals from filtered daily data
    const appMap = new Map<string, { totalSeconds: number; activityCount: number; devices: Record<string, number> }>()

    // We need to recalculate from raw data ideally, but for now we'll scale proportionally
    // This is a simplification - in production we'd want the raw data for accurate filtering
    const totalFilteredSeconds = filteredDaily.reduce((sum, d) => sum + d.totalSeconds, 0)
    const totalOriginalSeconds = data.dailySummary.reduce((sum, d) => sum + d.totalSeconds, 0)
    const scaleFactor = totalOriginalSeconds > 0 ? totalFilteredSeconds / totalOriginalSeconds : 1

    const filteredAppTotals: AppTotal[] = data.appTotals.map(app => ({
      ...app,
      totalSeconds: Math.round(app.totalSeconds * scaleFactor),
    })).filter(app => app.totalSeconds > 0)

    // Filter device totals
    const filteredDeviceTotals: DeviceTotal[] = data.deviceTotals
      .filter(d => selectedDevices.has(d.device))
      .map(device => {
        const deviceSeconds = filteredDaily.reduce(
          (sum, day) => sum + (day.devices[device.device] || 0),
          0
        )
        return {
          ...device,
          totalSeconds: deviceSeconds,
        }
      })
      .filter(d => d.totalSeconds > 0)

    // Recalculate percentages
    const deviceTotalSeconds = filteredDeviceTotals.reduce((sum, d) => sum + d.totalSeconds, 0)
    filteredDeviceTotals.forEach(d => {
      d.percentage = deviceTotalSeconds > 0 ? Math.round((d.totalSeconds / deviceTotalSeconds) * 10000) / 100 : 0
    })

    // Scale hourly patterns
    const filteredHourly: HourlyPattern[] = data.hourlyPatterns.map(h => ({
      ...h,
      totalSeconds: Math.round(h.totalSeconds * scaleFactor),
    }))

    // Filter monthly trends by date
    const filteredMonthly: MonthlyTrend[] = data.monthlyTrends.filter(m => {
      if (!cutoffDate) return true
      const monthDate = new Date(m.month + '-01')
      return monthDate >= cutoffDate
    }).map(m => ({
      ...m,
      totalSeconds: Math.round(m.totalSeconds * (selectedDevices.size / availableDevices.length)),
    }))

    return {
      dailySummary: filteredDaily,
      appTotals: filteredAppTotals,
      deviceTotals: filteredDeviceTotals,
      hourlyPatterns: filteredHourly,
      monthlyTrends: filteredMonthly,
      totalSeconds: totalFilteredSeconds,
      totalDays: filteredDaily.length,
      activeDays: filteredDaily.filter(d => d.totalSeconds > 0).length,
    }
  }, [data, filters, availableDevices])

  return (
    <FilterContext.Provider value={{ filters, setTimeRange, toggleDevice, availableDevices, filteredData }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider')
  }
  return context
}
