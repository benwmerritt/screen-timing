/**
 * Client-side data processor for Timing exports
 * Runs the same aggregation logic as preprocess.ts but in the browser
 */

import type { DashboardData, DailySummary, AppTotal, DeviceTotal, HourlyPattern, MonthlyTrend } from '../types'

interface RawActivity {
  id: string
  application: string
  device: string
  duration: string
  startDate: string
  endDate: string
  project?: string
  path?: string
}

interface ProgressCallback {
  (phase: string, current: number, total: number): void
}

// Parse duration string "H:MM:SS" to seconds
function parseDuration(duration: string): number {
  const parts = duration.split(':').map(Number)
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  return 0
}

// Normalize device names
function normalizeDevice(device: string): string {
  if (!device) return 'Unknown'

  const cleaned = device.replace(/\s*\(\d+\)\s*$/, '').trim()

  if (cleaned.toLowerCase().includes('macbook')) return "Benjamin's MacBook Pro"
  if (cleaned.toLowerCase().includes('iphone')) return 'iPhone'
  if (cleaned.toLowerCase().includes('ipad')) return 'iPad'

  return cleaned || 'Unknown'
}

// Process data in chunks to keep UI responsive
async function processInChunks<T>(
  items: T[],
  processor: (item: T) => void,
  chunkSize: number,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const total = items.length
  let processed = 0

  while (processed < total) {
    const chunk = items.slice(processed, processed + chunkSize)
    for (const item of chunk) {
      processor(item)
    }
    processed += chunk.length

    if (onProgress) {
      onProgress(processed, total)
    }

    // Yield to main thread every chunk
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

export async function processTimingData(
  rawData: RawActivity[],
  onProgress?: ProgressCallback
): Promise<DashboardData> {
  // Aggregators
  const dailyData = new Map<string, {
    totalSeconds: number
    activityCount: number
    apps: Map<string, number>
    devices: Record<string, number>
  }>()

  const appData = new Map<string, {
    totalSeconds: number
    activityCount: number
    devices: Record<string, number>
  }>()

  const deviceData = new Map<string, {
    totalSeconds: number
    activityCount: number
  }>()

  const hourlyData = new Map<number, {
    totalSeconds: number
    activityCount: number
    days: Set<string>
  }>()

  const monthlyData = new Map<string, {
    totalSeconds: number
    activityCount: number
    days: Set<string>
  }>()

  let totalRecords = 0
  let totalSeconds = 0
  let firstDate = ''
  let lastDate = ''

  // Process records
  const processRecord = (record: RawActivity) => {
    totalRecords++

    const seconds = parseDuration(record.duration)
    if (seconds <= 0) return

    totalSeconds += seconds

    const startDate = new Date(record.startDate)
    const dateStr = startDate.toISOString().split('T')[0]
    const hour = startDate.getUTCHours()
    const monthStr = dateStr.substring(0, 7)

    if (!firstDate || dateStr < firstDate) firstDate = dateStr
    if (!lastDate || dateStr > lastDate) lastDate = dateStr

    const device = normalizeDevice(record.device)
    const app = record.application || 'Unknown'

    // Daily aggregation
    if (!dailyData.has(dateStr)) {
      dailyData.set(dateStr, {
        totalSeconds: 0,
        activityCount: 0,
        apps: new Map(),
        devices: {},
      })
    }
    const day = dailyData.get(dateStr)!
    day.totalSeconds += seconds
    day.activityCount++
    day.apps.set(app, (day.apps.get(app) || 0) + seconds)
    day.devices[device] = (day.devices[device] || 0) + seconds

    // App aggregation
    if (!appData.has(app)) {
      appData.set(app, { totalSeconds: 0, activityCount: 0, devices: {} })
    }
    const appAgg = appData.get(app)!
    appAgg.totalSeconds += seconds
    appAgg.activityCount++
    appAgg.devices[device] = (appAgg.devices[device] || 0) + seconds

    // Device aggregation
    if (!deviceData.has(device)) {
      deviceData.set(device, { totalSeconds: 0, activityCount: 0 })
    }
    const deviceAgg = deviceData.get(device)!
    deviceAgg.totalSeconds += seconds
    deviceAgg.activityCount++

    // Hourly aggregation
    if (!hourlyData.has(hour)) {
      hourlyData.set(hour, { totalSeconds: 0, activityCount: 0, days: new Set() })
    }
    const hourAgg = hourlyData.get(hour)!
    hourAgg.totalSeconds += seconds
    hourAgg.activityCount++
    hourAgg.days.add(dateStr)

    // Monthly aggregation
    if (!monthlyData.has(monthStr)) {
      monthlyData.set(monthStr, { totalSeconds: 0, activityCount: 0, days: new Set() })
    }
    const monthAgg = monthlyData.get(monthStr)!
    monthAgg.totalSeconds += seconds
    monthAgg.activityCount++
    monthAgg.days.add(dateStr)
  }

  // Process in chunks
  await processInChunks(
    rawData,
    processRecord,
    50000, // Process 50k records at a time
    (current, total) => {
      if (onProgress) {
        onProgress('Processing records', current, total)
      }
    }
  )

  // Generate outputs
  onProgress?.('Generating summaries', 0, 1)

  // Daily summary
  const dailySummary: DailySummary[] = Array.from(dailyData.entries())
    .map(([date, data]) => {
      let topApp = ''
      let topAppSeconds = 0
      for (const [app, secs] of data.apps) {
        if (secs > topAppSeconds) {
          topApp = app
          topAppSeconds = secs
        }
      }
      return {
        date,
        totalSeconds: data.totalSeconds,
        activityCount: data.activityCount,
        topApp,
        devices: data.devices,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  // App totals
  const appTotals: AppTotal[] = Array.from(appData.entries())
    .map(([app, data]) => ({
      application: app,
      totalSeconds: data.totalSeconds,
      activityCount: data.activityCount,
      avgSessionSeconds: Math.round(data.totalSeconds / data.activityCount),
      devices: data.devices,
    }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds)

  // Device totals
  const deviceTotals: DeviceTotal[] = Array.from(deviceData.entries())
    .map(([device, data]) => ({
      device,
      totalSeconds: data.totalSeconds,
      activityCount: data.activityCount,
      percentage: Math.round((data.totalSeconds / totalSeconds) * 10000) / 100,
    }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds)

  // Hourly patterns
  const hourlyPatterns: HourlyPattern[] = Array.from({ length: 24 }, (_, hour) => {
    const data = hourlyData.get(hour)
    return {
      hour,
      totalSeconds: data?.totalSeconds || 0,
      activityCount: data?.activityCount || 0,
      avgSecondsPerDay: data ? Math.round(data.totalSeconds / data.days.size) : 0,
    }
  })

  // Monthly trends
  const monthlyTrends: MonthlyTrend[] = Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      totalSeconds: data.totalSeconds,
      activityCount: data.activityCount,
      avgSecondsPerDay: Math.round(data.totalSeconds / data.days.size),
      activeDays: data.days.size,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Metadata
  const metadata = {
    firstDate,
    lastDate,
    totalDays: dailyData.size,
    totalSeconds,
    totalActivities: totalRecords,
    processedAt: new Date().toISOString(),
  }

  onProgress?.('Complete', 1, 1)

  return {
    dailySummary,
    appTotals,
    deviceTotals,
    hourlyPatterns,
    monthlyTrends,
    metadata,
  }
}

// localStorage helpers
const STORAGE_KEY = 'timing-dashboard-data'

export function saveToLocalStorage(data: DashboardData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
    throw new Error('Failed to save data. The processed data may be too large for localStorage.')
  }
}

export function loadFromLocalStorage(): DashboardData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e)
  }
  return null
}

export function clearLocalStorage(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function hasStoredData(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}
