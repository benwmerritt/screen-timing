import { useEffect, useState, useCallback } from 'react'
import { Dashboard } from './components/Dashboard'
import { LoadingScreen } from './components/LoadingScreen'
import { FileUploader } from './components/FileUploader'
import { FilterProvider } from './context/FilterContext'
import { loadFromLocalStorage, clearLocalStorage } from './lib/processData'
import type { DashboardData } from './types'

type AppState = 'loading' | 'upload' | 'dashboard'

function App() {
  const [state, setState] = useState<AppState>('loading')
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    // First check localStorage
    const storedData = loadFromLocalStorage()
    if (storedData) {
      setData(storedData)
      setState('dashboard')
      return
    }

    // Then try to load from public/data/processed (for local dev)
    async function tryLoadProcessedData() {
      try {
        const [
          dailySummary,
          appTotals,
          deviceTotals,
          hourlyPatterns,
          monthlyTrends,
          metadata,
        ] = await Promise.all([
          fetch('/data/processed/daily-summary.json').then(r => {
            if (!r.ok) throw new Error('Not found')
            return r.json()
          }),
          fetch('/data/processed/app-totals.json').then(r => r.json()),
          fetch('/data/processed/device-totals.json').then(r => r.json()),
          fetch('/data/processed/hourly-patterns.json').then(r => r.json()),
          fetch('/data/processed/monthly-trends.json').then(r => r.json()),
          fetch('/data/processed/metadata.json').then(r => r.json()),
        ])

        setData({
          dailySummary,
          appTotals,
          deviceTotals,
          hourlyPatterns,
          monthlyTrends,
          metadata,
        })
        setState('dashboard')
      } catch {
        // No processed data available, show upload screen
        setState('upload')
      }
    }

    tryLoadProcessedData()
  }, [])

  const handleDataLoaded = useCallback((newData: DashboardData) => {
    setData(newData)
    setState('dashboard')
  }, [])

  const handleClearData = useCallback(() => {
    clearLocalStorage()
    setData(null)
    setState('upload')
  }, [])

  if (state === 'loading') {
    return <LoadingScreen />
  }

  if (state === 'upload') {
    return <FileUploader onDataLoaded={handleDataLoaded} />
  }

  if (!data) {
    return <FileUploader onDataLoaded={handleDataLoaded} />
  }

  return (
    <FilterProvider data={data}>
      <Dashboard data={data} onClearData={handleClearData} />
    </FilterProvider>
  )
}

export default App
