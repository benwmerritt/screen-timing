import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { DeviceTotal } from '../types'
import { formatDuration, formatPercent } from '../lib/formatters'
import './DeviceComparison.css'

interface DeviceComparisonProps {
  data: DeviceTotal[]
}

const DEVICE_COLORS: Record<string, string> = {
  'MacBook Pro': 'var(--chart-1)',
  'Mac': 'var(--chart-1)',
  'iPhone': 'var(--chart-3)',
  'iPad': 'var(--chart-2)',
}

const getDeviceColor = (device: string): string => {
  // Check for partial matches
  for (const [key, color] of Object.entries(DEVICE_COLORS)) {
    if (device.toLowerCase().includes(key.toLowerCase())) {
      return color
    }
  }
  return 'var(--chart-4)'
}

const getDeviceIcon = (device: string): string => {
  if (device.toLowerCase().includes('macbook') || device.toLowerCase().includes('mac')) {
    return '💻'
  }
  if (device.toLowerCase().includes('iphone')) {
    return '📱'
  }
  if (device.toLowerCase().includes('ipad')) {
    return '📲'
  }
  return '🖥️'
}

export function DeviceComparison({ data }: DeviceComparisonProps) {
  const totalSeconds = data.reduce((sum, d) => sum + d.totalSeconds, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null
    const device = payload[0].payload as DeviceTotal
    return (
      <div className="chart-tooltip">
        <div className="tooltip-title">{device.device}</div>
        <div className="tooltip-row">
          <span>Time:</span>
          <span className="mono">{formatDuration(device.totalSeconds)}</span>
        </div>
        <div className="tooltip-row">
          <span>Share:</span>
          <span className="mono">{formatPercent(device.totalSeconds, totalSeconds)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="device-comparison">
      <div className="device-pie">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="totalSeconds"
              nameKey="device"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.device} fill={getDeviceColor(entry.device)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="device-list">
        {data.map((device) => (
          <div key={device.device} className="device-row">
            <span className="device-icon">{getDeviceIcon(device.device)}</span>
            <div className="device-info">
              <span className="device-name">{device.device}</span>
              <div className="device-bar-container">
                <div
                  className="device-bar"
                  style={{
                    width: `${(device.totalSeconds / totalSeconds) * 100}%`,
                    background: getDeviceColor(device.device),
                  }}
                />
              </div>
            </div>
            <div className="device-stats">
              <span className="device-time mono">{formatDuration(device.totalSeconds)}</span>
              <span className="device-percent text-muted mono">
                {formatPercent(device.totalSeconds, totalSeconds)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
