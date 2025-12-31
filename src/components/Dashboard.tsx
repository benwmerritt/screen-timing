import type { DashboardData } from '../types'
import { useFilters } from '../context/FilterContext'
import { formatDuration, formatNumber } from '../lib/formatters'
import { FilterBar } from './FilterBar'
import { CalendarHeatmap } from './CalendarHeatmap'
import { AppBreakdown } from './AppBreakdown'
import { DeviceComparison } from './DeviceComparison'
import { TimePatterns } from './TimePatterns'
import { TrendChart } from './TrendChart'
import './Dashboard.css'

interface DashboardProps {
  data: DashboardData
}

export function Dashboard({ data }: DashboardProps) {
  const { filteredData } = useFilters()

  if (!filteredData) {
    return <div>Loading...</div>
  }

  const { dailySummary, appTotals, deviceTotals, hourlyPatterns, monthlyTrends, totalSeconds, activeDays } = filteredData

  // Calculate summary stats from filtered data
  const totalHours = Math.round(totalSeconds / 3600)
  const avgHoursPerDay = activeDays > 0 ? totalSeconds / activeDays / 3600 : 0

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Timing Dashboard</h1>
          <p className="text-secondary">
            {data.metadata.firstDate} — {data.metadata.lastDate}
          </p>
        </div>
      </header>

      <FilterBar />

      <div className="summary-cards">
        <div className="card summary-card">
          <span className="summary-label">Total Time</span>
          <span className="summary-value mono">{formatNumber(totalHours)}<span className="summary-unit">h</span></span>
        </div>
        <div className="card summary-card">
          <span className="summary-label">Daily Average</span>
          <span className="summary-value mono">{avgHoursPerDay.toFixed(1)}<span className="summary-unit">h</span></span>
        </div>
        <div className="card summary-card">
          <span className="summary-label">Active Days</span>
          <span className="summary-value mono">{formatNumber(activeDays)}</span>
        </div>
      </div>

      <div className="card full-width">
        <h2>Activity Heatmap</h2>
        <CalendarHeatmap data={dailySummary} />
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2>Top Apps</h2>
          <AppBreakdown data={appTotals} />
        </div>
        <div className="card">
          <h2>Devices</h2>
          <DeviceComparison data={deviceTotals} />
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2>Time of Day</h2>
          <TimePatterns data={hourlyPatterns} />
        </div>
        <div className="card">
          <h2>Monthly Trends</h2>
          <TrendChart data={monthlyTrends} />
        </div>
      </div>

      <footer className="dashboard-footer">
        <p className="text-muted">
          Powered by Timing app data • {formatNumber(data.metadata.totalActivities)} activities tracked
        </p>
      </footer>
    </div>
  )
}
