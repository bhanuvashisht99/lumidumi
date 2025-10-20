'use client'

import { useState } from 'react'
import { isHeicFile, processImageFileWithFallback } from '@/lib/heicConverterBrowser'

export default function TestHeicPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string>('')
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  // Capture console logs
  const originalLog = console.log
  const originalError = console.error
  const originalWarn = console.warn

  const captureLog = (level: string, ...args: any[]) => {
    const message = `[${level}] ${args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ')}`
    setLogs(prev => [...prev, message])
  }

  const startCapturingLogs = () => {
    console.log = (...args) => {
      originalLog(...args)
      captureLog('LOG', ...args)
    }
    console.error = (...args) => {
      originalError(...args)
      captureLog('ERROR', ...args)
    }
    console.warn = (...args) => {
      originalWarn(...args)
      captureLog('WARN', ...args)
    }
  }

  const stopCapturingLogs = () => {
    console.log = originalLog
    console.error = originalError
    console.warn = originalWarn
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setStatus(`Selected: ${file.name} (${file.type}, ${file.size} bytes)`)
      setLogs([])
      setResultImage(null)
    }
  }

  const testConversion = async () => {
    if (!selectedFile) return

    setStatus('Testing conversion...')
    setLogs([])
    startCapturingLogs()

    try {
      const result = await processImageFileWithFallback(selectedFile)
      setStatus(`✅ Conversion successful! Result: ${result.name} (${result.type}, ${result.size} bytes)`)

      // Show the result image
      const url = URL.createObjectURL(result)
      setResultImage(url)
    } catch (error) {
      setStatus(`❌ Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      stopCapturingLogs()
    }
  }

  const testBrowserSupport = () => {
    setLogs([])
    startCapturingLogs()

    const support = {
      hasCreateImageBitmap: 'createImageBitmap' in window,
      hasCanvas: typeof document !== 'undefined' && typeof document.createElement === 'function',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    }

    console.log('🔍 Browser HEIC Support Test:', support)

    setStatus(`Browser support check completed - see logs below`)
    stopCapturingLogs()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">HEIC Conversion Test</h1>

        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">File Selection</h2>
          <input
            type="file"
            accept=".heic,.heif,image/heic,image/heif,image/*"
            onChange={handleFileSelect}
            className="mb-4"
          />

          <div className="flex gap-4 mb-4">
            <button
              onClick={testBrowserSupport}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Browser Support
            </button>
            <button
              onClick={testConversion}
              disabled={!selectedFile}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Test Conversion
            </button>
            <button
              onClick={() => {
                setLogs([])
                setStatus('')
                setResultImage(null)
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Logs
            </button>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            Status: {status}
          </div>
        </div>

        {resultImage && (
          <div className="bg-white rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Result Image</h2>
            <img
              src={resultImage}
              alt="Converted result"
              className="max-w-full max-h-96 object-contain border"
            />
          </div>
        )}

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Console Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet - click Test Browser Support or Test Conversion</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 whitespace-pre-wrap break-words">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}