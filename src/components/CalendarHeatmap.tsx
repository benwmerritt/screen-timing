import { useMemo } from 'react'
import type { DailySummary } from '../types'
import { formatDuration, formatDate } from '../lib/formatters'
import './CalendarHeatmap.css'

interface CalendarHeatmapProps {
  data: DailySummary[]
}

const CELL_SIZE = 12
const CELL_GAP = 3
const DAYS_IN_WEEK = 7

export function CalendarHeatmap({ data }: CalendarHeatmapProps) {
  const { weeks, maxSeconds, monthLabels } = useMemo(() => {
    // Create a map of date -> data
    const dateMap = new Map(data.map(d => [d.date, d]))

    // Find date range
    const dates = data.map(d => new Date(d.date)).sort((a, b) => a.getTime() - b.getTime())
    const startDate = dates[0]
    const endDate = dates[dates.length - 1]

    // Adjust start to beginning of week (Sunday)
    const adjustedStart = new Date(startDate)
    adjustedStart.setDate(adjustedStart.getDate() - adjustedStart.getDay())

    // Adjust end to end of week (Saturday)
    const adjustedEnd = new Date(endDate)
    adjustedEnd.setDate(adjustedEnd.getDate() + (6 - adjustedEnd.getDay()))

    // Build weeks array
    const weeks: (DailySummary | null)[][] = []
    const currentDate = new Date(adjustedStart)
    let currentWeek: (DailySummary | null)[] = []
    let maxSecs = 0

    // Track months for labels
    const monthPositions: { month: string; weekIndex: number }[] = []
    let lastMonth = -1

    while (currentDate <= adjustedEnd) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayData = dateMap.get(dateStr) || null

      if (dayData && dayData.totalSeconds > maxSecs) {
        maxSecs = dayData.totalSeconds
      }

      // Track month changes
      if (currentDate.getMonth() !== lastMonth && currentDate.getDay() === 0) {
        monthPositions.push({
          month: currentDate.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex: weeks.length,
        })
        lastMonth = currentDate.getMonth()
      }

      currentWeek.push(dayData)

      if (currentWeek.length === DAYS_IN_WEEK) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    return { weeks, maxSeconds: maxSecs, monthLabels: monthPositions }
  }, [data])

  const getColor = (seconds: number): string => {
    if (seconds === 0) return 'var(--heatmap-0)'
    const intensity = seconds / maxSeconds
    if (intensity < 0.25) return 'var(--heatmap-1)'
    if (intensity < 0.5) return 'var(--heatmap-2)'
    if (intensity < 0.75) return 'var(--heatmap-3)'
    return 'var(--heatmap-4)'
  }

  const totalWidth = weeks.length * (CELL_SIZE + CELL_GAP) + 40
  const totalHeight = DAYS_IN_WEEK * (CELL_SIZE + CELL_GAP) + 25

  return (
    <div className="calendar-heatmap">
      <div className="heatmap-scroll">
        <svg width={totalWidth} height={totalHeight}>
          {/* Month labels */}
          {monthLabels.map(({ month, weekIndex }) => (
            <text
              key={`${month}-${weekIndex}`}
              x={40 + weekIndex * (CELL_SIZE + CELL_GAP)}
              y={10}
              className="month-label"
            >
              {month}
            </text>
          ))}

          {/* Day labels */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
            i % 2 === 1 && (
              <text
                key={day}
                x={30}
                y={25 + i * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2}
                className="day-label"
              >
                {day}
              </text>
            )
          ))}

          {/* Cells */}
          {weeks.map((week, weekIndex) => (
            <g key={weekIndex} transform={`translate(${40 + weekIndex * (CELL_SIZE + CELL_GAP)}, 20)`}>
              {week.map((day, dayIndex) => (
                <rect
                  key={dayIndex}
                  x={0}
                  y={dayIndex * (CELL_SIZE + CELL_GAP)}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={2}
                  fill={day ? getColor(day.totalSeconds) : 'var(--heatmap-0)'}
                  className="heatmap-cell"
                >
                  {day && (
                    <title>
                      {formatDate(day.date)}: {formatDuration(day.totalSeconds)}
                      {day.topApp && `\nTop: ${day.topApp}`}
                    </title>
                  )}
                </rect>
              ))}
            </g>
          ))}
        </svg>
      </div>

      <div className="heatmap-legend">
        <span className="text-muted">Less</span>
        {[0, 1, 2, 3, 4].map(level => (
          <div
            key={level}
            className="legend-cell"
            style={{ background: `var(--heatmap-${level})` }}
          />
        ))}
        <span className="text-muted">More</span>
      </div>
    </div>
  )
}
