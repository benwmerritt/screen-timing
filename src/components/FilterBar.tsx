import { useFilters, TIME_RANGE_LABELS, type TimeRange } from '../context/FilterContext'
import './FilterBar.css'

const TIME_RANGES: TimeRange[] = ['week', '30d', '90d', 'year', '2year', '3year', 'all']

// Device display names and icons
const DEVICE_CONFIG: Record<string, { label: string; icon: string }> = {
  "Benjamin's MacBook Pro": { label: 'Mac', icon: '💻' },
  'iPhone': { label: 'iPhone', icon: '📱' },
  'iPad': { label: 'iPad', icon: '📲' },
}

export function FilterBar() {
  const { filters, setTimeRange, toggleDevice, availableDevices } = useFilters()

  return (
    <div className="filter-bar">
      <div className="filter-section">
        <span className="filter-label">Time Range</span>
        <div className="time-range-pills">
          {TIME_RANGES.map(range => (
            <button
              key={range}
              className={`pill ${filters.timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {TIME_RANGE_LABELS[range]}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-divider" />

      <div className="filter-section">
        <span className="filter-label">Devices</span>
        <div className="device-toggles">
          {availableDevices.map(device => {
            const config = DEVICE_CONFIG[device] || { label: device, icon: '🖥️' }
            const isSelected = filters.devices.includes(device)
            return (
              <button
                key={device}
                className={`device-toggle ${isSelected ? 'active' : ''}`}
                onClick={() => toggleDevice(device)}
                title={device}
              >
                <span className="device-icon">{config.icon}</span>
                <span className="device-label">{config.label}</span>
                <span className={`device-check ${isSelected ? 'checked' : ''}`}>
                  {isSelected ? '✓' : ''}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
