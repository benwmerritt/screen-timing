import { useEffect, useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { LoadingScreen } from './components/LoadingScreen'
import { FilterProvider } from './context/FilterContext'
import type { DashboardData } from './types'

function App() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [
          dailySummary,
          appTotals,
          deviceTotals,
          hourlyPatterns,
          monthlyTrends,
          metadata,
        ] = await Promise.all([
          fetch('/data/processed/daily-summary.json').then(r => r.json()),
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
      } catch (err) {
        setError('Failed to load data. Have you run the preprocessing script?')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  if (error || !data) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <h1 style={{ marginBottom: '1rem' }}>Data Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {error || 'Please run the preprocessing script first:'}
        </p>
        <code style={{
          background: 'var(--bg-secondary)',
          padding: '1rem 2rem',
          borderRadius: '8px',
          fontFamily: 'monospace',
        }}>
          npm run preprocess
        </code>
      </div>
    )
  }

  return (
    <FilterProvider data={data}>
      <Dashboard data={data} />
    </FilterProvider>
  )
}

export default App
