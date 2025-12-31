// Raw activity record from Timing export
export interface TimingActivity {
  id: string
  application: string
  device: string
  duration: string // "H:MM:SS" format
  startDate: string // ISO 8601
  endDate: string // ISO 8601
  project?: string // Hierarchical with ▸ delimiter
  path?: string
  activityTitle?: string
}

// Processed daily summary
export interface DailySummary {
  date: string // "YYYY-MM-DD"
  totalSeconds: number
  activityCount: number
  topApp: string
  devices: Record<string, number>
}

// App usage totals
export interface AppTotal {
  application: string
  totalSeconds: number
  activityCount: number
  avgSessionSeconds: number
  devices: Record<string, number>
}

// Device totals
export interface DeviceTotal {
  device: string
  totalSeconds: number
  activityCount: number
  percentage: number
}

// Hourly activity pattern
export interface HourlyPattern {
  hour: number // 0-23
  totalSeconds: number
  activityCount: number
  avgSecondsPerDay: number
}

// Monthly trend data
export interface MonthlyTrend {
  month: string // "YYYY-MM"
  totalSeconds: number
  activityCount: number
  avgSecondsPerDay: number
  activeDays: number
}

// Project tree node
export interface ProjectNode {
  name: string
  totalSeconds: number
  activityCount: number
  children?: ProjectNode[]
}

// Metadata about the dataset
export interface Metadata {
  firstDate: string
  lastDate: string
  totalDays: number
  totalSeconds: number
  totalActivities: number
  processedAt: string
}

// Combined dashboard data
export interface DashboardData {
  dailySummary: DailySummary[]
  appTotals: AppTotal[]
  deviceTotals: DeviceTotal[]
  hourlyPatterns: HourlyPattern[]
  monthlyTrends: MonthlyTrend[]
  metadata: Metadata
}
