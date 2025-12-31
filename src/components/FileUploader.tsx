import { useState, useCallback, useRef } from 'react'
import { processTimingData, saveToLocalStorage } from '../lib/processData'
import type { DashboardData } from '../types'
import './FileUploader.css'

interface FileUploaderProps {
  onDataLoaded: (data: DashboardData) => void
}

type UploadState = 'idle' | 'reading' | 'processing' | 'error'

export function FileUploader({ onDataLoaded }: FileUploaderProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState({ phase: '', current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setState('reading')
    setProgress({ phase: 'Reading file', current: 0, total: 1 })

    try {
      // Read file as text
      const text = await file.text()
      setProgress({ phase: 'Parsing JSON', current: 0, total: 1 })

      // Parse JSON
      let rawData
      try {
        rawData = JSON.parse(text)
      } catch {
        throw new Error('Invalid JSON file. Please select a valid Timing export.')
      }

      // Validate structure
      if (!Array.isArray(rawData)) {
        throw new Error('Invalid file format. Expected an array of activities.')
      }

      if (rawData.length === 0) {
        throw new Error('File contains no activities.')
      }

      // Check for expected fields
      const sample = rawData[0]
      if (!sample.application || !sample.duration || !sample.startDate) {
        throw new Error('Invalid activity format. Make sure this is a Timing "All Activities" export.')
      }

      setState('processing')

      // Process data
      const processedData = await processTimingData(rawData, (phase, current, total) => {
        setProgress({ phase, current, total })
      })

      // Save to localStorage
      saveToLocalStorage(processedData)

      // Notify parent
      onDataLoaded(processedData)
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }, [onDataLoaded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.json')) {
      handleFile(file)
    } else {
      setError('Please drop a JSON file')
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const progressPercent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div className="uploader-container">
      <div className="uploader-content">
        <h1 className="uploader-title">Timing Dashboard</h1>
        <p className="uploader-subtitle">Visualize your screen time data</p>

        {state === 'idle' || state === 'error' ? (
          <>
            <div
              className={`drop-zone ${isDragging ? 'dragging' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div className="drop-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="drop-text">
                {isDragging ? 'Drop file here' : 'Drop your Timing export here'}
              </p>
              <p className="drop-hint">
                Drag <code>All Activities.json</code> or click to browse
              </p>
            </div>

            {error && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <div className="privacy-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Your data stays in your browser. Nothing is uploaded to any server.</span>
            </div>

            <div className="instructions">
              <h3>How to export from Timing</h3>
              <ol>
                <li>Open Timing app on your Mac</li>
                <li>Go to <strong>File → Export</strong></li>
                <li>Choose <strong>JSON</strong> format</li>
                <li>Select <strong>All Activities</strong></li>
                <li>Drop the exported file here</li>
              </ol>
            </div>
          </>
        ) : (
          <div className="processing-container">
            <div className="processing-spinner"></div>
            <p className="processing-phase">{progress.phase}</p>
            {progress.total > 1 && (
              <>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="progress-text">
                  {progress.current.toLocaleString()} / {progress.total.toLocaleString()} records ({progressPercent}%)
                </p>
              </>
            )}
            <p className="processing-hint">This may take 20-60 seconds for large exports</p>
          </div>
        )}
      </div>
    </div>
  )
}
