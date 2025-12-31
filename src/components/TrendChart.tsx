import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { MonthlyTrend } from '../types'
import { formatDuration, formatMonth } from '../lib/formatters'
import './TrendChart.css'

interface TrendChartProps {
  data: MonthlyTrend[]
}

export function TrendChart({ data }: TrendChartProps) {
  // Calculate average
  const avgSeconds = data.reduce((sum, m) => sum + m.totalSeconds, 0) / data.length

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null
    const month = payload[0].payload as MonthlyTrend
    return (
      <div className="chart-tooltip">
        <div className="tooltip-title">{formatMonth(month.month)}</div>
        <div className="tooltip-row">
          <span>Total time:</span>
          <span className="mono">{formatDuration(month.totalSeconds)}</span>
        </div>
        <div className="tooltip-row">
          <span>Daily avg:</span>
          <span className="mono">{formatDuration(month.avgSecondsPerDay)}</span>
        </div>
        <div className="tooltip-row">
          <span>Active days:</span>
          <span className="mono">{month.activeDays}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="trend-chart">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <defs>
            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            tickFormatter={(m) => {
              const [year, month] = m.split('-')
              return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short' })
            }}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(s) => `${Math.round(s / 3600)}h`}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="totalSeconds"
            stroke="var(--accent-blue)"
            strokeWidth={2}
            fill="url(#colorTrend)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="trend-stats">
        <div className="trend-stat">
          <span className="stat-label text-muted">Monthly avg</span>
          <span className="stat-value mono">{formatDuration(avgSeconds)}</span>
        </div>
        <div className="trend-stat">
          <span className="stat-label text-muted">Best month</span>
          <span className="stat-value mono">
            {formatMonth(data.reduce((a, b) => a.totalSeconds > b.totalSeconds ? a : b).month)}
          </span>
        </div>
      </div>
    </div>
  )
}
