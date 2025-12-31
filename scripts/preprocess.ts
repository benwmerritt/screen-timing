/**
 * Timing Data Preprocessor
 *
 * Streams through the large JSON export and aggregates into smaller files
 * for efficient dashboard loading.
 *
 * Run with: npm run preprocess
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// For large file, we'll read in chunks
// stream-json has ESM compatibility issues, so we'll use a simpler approach

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data', 'processed')
const INPUT_FILE = join(DATA_DIR, 'All Activities.json')

// Types
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

interface DailySummary {
  date: string
  totalSeconds: number
  activityCount: number
  topApp: string
  devices: Record<string, number>
}

interface AppTotal {
  application: string
  totalSeconds: number
  activityCount: number
  avgSessionSeconds: number
  devices: Record<string, number>
}

interface DeviceTotal {
  device: string
  totalSeconds: number
  activityCount: number
  percentage: number
}

interface HourlyPattern {
  hour: number
  totalSeconds: number
  activityCount: number
  avgSecondsPerDay: number
}

interface MonthlyTrend {
  month: string
  totalSeconds: number
  activityCount: number
  avgSecondsPerDay: number
  activeDays: number
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

  // Clean up numbered devices like "Benjamin's MacBook Pro (2)"
  const cleaned = device.replace(/\s*\(\d+\)\s*$/, '').trim()

  if (cleaned.toLowerCase().includes('macbook')) return "Benjamin's MacBook Pro"
  if (cleaned.toLowerCase().includes('iphone')) return 'iPhone'
  if (cleaned.toLowerCase().includes('ipad')) return 'iPad'

  return cleaned || 'Unknown'
}

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

function processRecord(record: RawActivity) {
  totalRecords++

  const seconds = parseDuration(record.duration)
  if (seconds <= 0) return

  totalSeconds += seconds

  // Parse date
  const startDate = new Date(record.startDate)
  const dateStr = startDate.toISOString().split('T')[0]
  const hour = startDate.getUTCHours()
  const monthStr = dateStr.substring(0, 7)

  // Track date range
  if (!firstDate || dateStr < firstDate) firstDate = dateStr
  if (!lastDate || dateStr > lastDate) lastDate = dateStr

  // Normalize device
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

function generateOutputs() {
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

  // App totals (sorted by total time)
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

  return {
    dailySummary,
    appTotals,
    deviceTotals,
    hourlyPatterns,
    monthlyTrends,
    metadata,
  }
}

async function main() {
  console.log('🕐 Timing Data Preprocessor')
  console.log('━'.repeat(40))

  // Check input file exists
  if (!existsSync(INPUT_FILE)) {
    console.error(`❌ Input file not found: ${INPUT_FILE}`)
    console.error('   Make sure "All Activities.json" is in the data/ folder')
    process.exit(1)
  }

  // Create output directory
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  console.log(`📂 Reading: ${INPUT_FILE}`)
  console.log('⏳ Loading JSON file (this may take a moment)...')

  const startTime = Date.now()

  try {
    // Read and parse the JSON file
    const rawData = readFileSync(INPUT_FILE, 'utf-8')
    console.log(`   File loaded in ${((Date.now() - startTime) / 1000).toFixed(1)}s`)

    console.log('⏳ Parsing JSON...')
    const parseStart = Date.now()
    const data: RawActivity[] = JSON.parse(rawData)
    console.log(`   Parsed ${data.length.toLocaleString()} records in ${((Date.now() - parseStart) / 1000).toFixed(1)}s`)

    console.log('⏳ Processing records...')
    const processStart = Date.now()

    for (let i = 0; i < data.length; i++) {
      processRecord(data[i])

      // Progress logging every 200k records
      if (i > 0 && i % 200000 === 0) {
        console.log(`   Processed ${i.toLocaleString()} records...`)
      }
    }

    const elapsed = ((Date.now() - processStart) / 1000).toFixed(1)
    console.log(`✅ Processed ${totalRecords.toLocaleString()} records in ${elapsed}s`)
    console.log('')

    // Generate outputs
    console.log('📊 Generating aggregated files...')
    const outputs = generateOutputs()

    // Write files
    const files = [
      ['daily-summary.json', outputs.dailySummary],
      ['app-totals.json', outputs.appTotals],
      ['device-totals.json', outputs.deviceTotals],
      ['hourly-patterns.json', outputs.hourlyPatterns],
      ['monthly-trends.json', outputs.monthlyTrends],
      ['metadata.json', outputs.metadata],
    ] as const

    for (const [filename, data] of files) {
      const filepath = join(OUTPUT_DIR, filename)
      writeFileSync(filepath, JSON.stringify(data, null, 2))
      const size = JSON.stringify(data).length
      console.log(`   ✓ ${filename} (${(size / 1024).toFixed(1)} KB)`)
    }

    console.log('')
    console.log('━'.repeat(40))
    console.log(`📈 Summary:`)
    console.log(`   Total time: ${Math.round(totalSeconds / 3600).toLocaleString()} hours`)
    console.log(`   Date range: ${firstDate} to ${lastDate}`)
    console.log(`   Active days: ${dailyData.size}`)
    console.log(`   Unique apps: ${appData.size}`)
    console.log(`   Devices: ${deviceData.size}`)
    console.log('')
    console.log('🚀 Run "npm run dev" to start the dashboard!')

  } catch (error) {
    console.error('❌ Error processing file:', error)
    process.exit(1)
  }
}

main().catch(console.error)
