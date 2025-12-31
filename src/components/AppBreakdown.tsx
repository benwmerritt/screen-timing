import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { AppTotal } from '../types'
import { formatDuration, formatPercent } from '../lib/formatters'
import { AppIcon } from './AppIcon'
import './AppBreakdown.css'

interface AppBreakdownProps {
  data: AppTotal[]
  limit?: number
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
  'var(--chart-8)',
]

export function AppBreakdown({ data, limit = 10 }: AppBreakdownProps) {
  const topApps = data.slice(0, limit)
  const totalSeconds = data.reduce((sum, app) => sum + app.totalSeconds, 0)

  const pieData = topApps.map((app, i) => ({
    ...app,
    fill: COLORS[i % COLORS.length],
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null
    const app = payload[0].payload as AppTotal
    return (
      <div className="chart-tooltip">
        <div className="tooltip-title">{app.application}</div>
        <div className="tooltip-row">
          <span>Time:</span>
          <span className="mono">{formatDuration(app.totalSeconds)}</span>
        </div>
        <div className="tooltip-row">
          <span>Share:</span>
          <span className="mono">{formatPercent(app.totalSeconds, totalSeconds)}</span>
        </div>
        <div className="tooltip-row">
          <span>Sessions:</span>
          <span className="mono">{app.activityCount.toLocaleString()}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="app-breakdown">
      <div className="pie-container">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="totalSeconds"
              nameKey="application"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {pieData.map((entry, index) => (
                <Cell key={entry.application} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="app-list">
        {topApps.map((app) => (
          <div key={app.application} className="app-row">
            <AppIcon name={app.application} size={28} />
            <span className="app-name">{app.application}</span>
            <span className="app-time mono">{formatDuration(app.totalSeconds)}</span>
            <span className="app-percent text-muted mono">
              {formatPercent(app.totalSeconds, totalSeconds)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
