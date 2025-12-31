import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { HourlyPattern } from '../types'
import { formatDuration, formatHour } from '../lib/formatters'
import './TimePatterns.css'

interface TimePatternsProps {
  data: HourlyPattern[]
}

export function TimePatterns({ data }: TimePatternsProps) {
  // Find max for color scaling
  const maxSeconds = Math.max(...data.map(h => h.totalSeconds))

  const getBarColor = (seconds: number): string => {
    const intensity = seconds / maxSeconds
    if (intensity < 0.25) return 'var(--heatmap-1)'
    if (intensity < 0.5) return 'var(--heatmap-2)'
    if (intensity < 0.75) return 'var(--heatmap-3)'
    return 'var(--heatmap-4)'
  }

  // Find peak hours
  const sortedByTime = [...data].sort((a, b) => b.totalSeconds - a.totalSeconds)
  const peakHours = sortedByTime.slice(0, 3)

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null
    const hour = payload[0].payload as HourlyPattern
    return (
      <div className="chart-tooltip">
        <div className="tooltip-title">{formatHour(hour.hour)}</div>
        <div className="tooltip-row">
          <span>Total time:</span>
          <span className="mono">{formatDuration(hour.totalSeconds)}</span>
        </div>
        <div className="tooltip-row">
          <span>Sessions:</span>
          <span className="mono">{hour.activityCount.toLocaleString()}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="time-patterns">
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
            <XAxis
              dataKey="hour"
              tickFormatter={(h) => h % 6 === 0 ? formatHour(h) : ''}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-tertiary)' }} />
            <Bar dataKey="totalSeconds" radius={[2, 2, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.hour} fill={getBarColor(entry.totalSeconds)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="peak-hours">
        <span className="peak-label text-muted">Peak hours:</span>
        <div className="peak-list">
          {peakHours.map((hour) => (
            <span key={hour.hour} className="peak-badge">
              {formatHour(hour.hour)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
