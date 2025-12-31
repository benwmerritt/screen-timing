# Timing Dashboard - Implementation Plan

## Overview
Build a React + Vite dashboard to visualize 1.4M activity records (475MB) from the Timing app.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    DATA PREPROCESSING                        │
│  All Activities.json (475MB) → Stream Parse → Aggregate      │
│                           ↓                                  │
│  Output: 7 small JSON files (~220KB total)                   │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                     REACT DASHBOARD                          │
│  Loads pre-aggregated data, renders interactive charts       │
└──────────────────────────────────────────────────────────────┘
```

## File Structure

```
timing/
├── data/
│   ├── All Activities.json      # Source (gitignored - too large)
│   └── processed/               # Generated aggregates (~220KB)
│       ├── daily-summary.json   # Calendar heatmap data
│       ├── app-totals.json      # App usage breakdown
│       ├── device-totals.json   # Device comparison
│       ├── project-tree.json    # Hierarchical projects
│       ├── hourly-patterns.json # Time-of-day analysis
│       ├── monthly-trends.json  # Monthly trends
│       └── metadata.json        # Date range, totals
├── scripts/
│   └── preprocess.ts            # Data preprocessing
├── src/
│   ├── components/
│   │   ├── CalendarHeatmap.tsx  # GitHub-style heatmap
│   │   ├── AppBreakdown.tsx     # Pie/bar charts
│   │   ├── DeviceComparison.tsx # Device usage
│   │   ├── TimePatterns.tsx     # Hour/day patterns
│   │   ├── TrendChart.tsx       # Weekly/monthly trends
│   │   └── ProjectTree.tsx      # Treemap/list view
│   ├── hooks/
│   │   └── useData.ts           # Data loading
│   └── lib/
│       ├── dataUtils.ts         # Duration parsing, etc.
│       └── colors.ts            # Chart palette
├── package.json
└── vite.config.ts
```

## Implementation Steps

### Phase 1: Setup
1. Initialize Vite + React + TypeScript project
2. Install dependencies: recharts, date-fns, @radix-ui components
3. Configure dark theme (GitHub-style: #0d1117 background)

### Phase 2: Preprocessing Script
4. Create `scripts/preprocess.ts` using stream-json for memory efficiency
5. Parse duration strings ("H:MM:SS") → seconds
6. Aggregate data into 7 output files:
   - **daily-summary.json**: date, totalSeconds, topApp, deviceBreakdown
   - **app-totals.json**: app, totalSeconds, sessionCount, avgSession
   - **device-totals.json**: device, totalSeconds, percentage
   - **project-tree.json**: hierarchical structure with durations
   - **hourly-patterns.json**: hour 0-23 with activity distribution
   - **monthly-trends.json**: year-month, totals, averages
   - **metadata.json**: dateRange, totalHours, recordCount

### Phase 3: Dashboard Core
7. Create useData hook to fetch all processed JSON files
8. Build Dashboard layout with grid system
9. Create summary cards (Total Time, Daily Avg, Top App, Active Days)

### Phase 4: Charts (using Recharts)
10. **CalendarHeatmap** - Custom SVG grid, 52 weeks x 7 days
11. **AppBreakdown** - PieChart for top 10, BarChart for details
12. **DeviceComparison** - Donut chart with Mac/iPhone/iPad
13. **TimePatterns** - RadialBarChart for hours, heatmap for day×hour
14. **TrendChart** - AreaChart with gradient fill

### Phase 5: Interactivity
15. Add date range picker with presets (7d, 30d, 90d, Year, All)
16. Add device filter (checkboxes)
17. Add app filter (search + top apps)
18. Implement click-to-drill-down on charts

### Phase 6: Polish
19. Add loading skeletons
20. Add tooltips with formatted durations
21. Responsive layout adjustments
22. Export to CSV/PNG options

## Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "recharts": "^2.10.0",
    "date-fns": "^3.0.0",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0"
  },
  "devDependencies": {
    "stream-json": "^1.8.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

## Data Insights from Analysis

| Dimension | Top Values |
|-----------|------------|
| Apps | Safari (257K), Finder (124K), Arc (105K), qBittorrent (92K), Obsidian (85K) |
| Devices | MacBook Pro (1M+), iPhone (171K), iPad (70K) |
| Projects | Hierarchical with ▸ delimiter (e.g., "Code & AI ▸ AI ▸ Claude") |
| Duration Format | "H:MM:SS" (needs parsing to seconds) |
| Date Range | April 2023 - Present (~2 years) |

## Design Notes

- **Dark mode** primary (GitHub-inspired palette)
- **Color scale** for heatmap: #161b22 → #0e4429 → #006d32 → #26a641 → #39d353
- **Chart colors**: Blues, purples, greens for visual variety
- **Typography**: System fonts, monospace for numbers

## Critical Path

1. Preprocessing script MUST work first (no dashboard without data)
2. Calendar heatmap is the hero visual - get it right early
3. Filters can be added incrementally after core charts work
