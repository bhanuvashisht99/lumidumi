'use client'

import { useState, useRef } from 'react'
import { processImageFileWithFallback, HeicConversionError, isHeicFile, isHeicConversionSupported } from '@/lib/heicConverterBrowser'

interface SimpleImageUploadProps {
  onImageUpload: (file: File, previewUrl: string) => void
  maxSize?: number // in MB
  accept?: string
  debug?: boolean
}

export default function SimpleImageUpload({
  onImageUpload,
  maxSize = 10,
  accept = "image/*",
  debug = false
}: SimpleImageUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setProcessing(false)

    // Basic validation
    if (!file.type.startsWith('image/') && !isHeicFile(file)) {
      setError('Please select an image file')
      return
    }

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    try {
      // Show processing state for HEIC files
      const isHeicImage = isHeicFile(file)
      if (isHeicImage) {
        setProcessing(true)
        console.log('Processing HEIC file:', file.name)
      }

      // Process the file (handles HEIC conversion if needed)
      console.log('Processing file:', file.name, file.type)
      const processedFile = await processImageFileWithFallback(file)
      console.log('File processed:', processedFile.name, processedFile.type)

      // Create preview URL
      const previewUrl = URL.createObjectURL(processedFile)
      console.log('Created preview URL:', previewUrl)

      // Call parent callback with processed file
      onImageUpload(processedFile, previewUrl)
    } catch (error) {
      console.error('Error processing file:', error)

      if (error instanceof HeicConversionError) {
        // Special handling for HEIC files with conversion instructions
        setError(error.message)
      } else {
        setError(error instanceof Error ? error.message : 'Failed to process image')
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          processing
            ? 'border-blue-400 bg-blue-50'
            : dragOver
            ? 'border-blue-400 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !processing && fileInputRef.current?.click()}
      >
        <div className="space-y-4">
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <div>
                <p className="text-lg font-medium text-blue-700">
                  Processing image...
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  Processing your image for upload
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-4xl">📷</div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Drop your image here or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports JPEG, PNG, WebP, HEIC (max {maxSize}MB)
                </p>
              </div>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={processing}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <div className="whitespace-pre-line">{error}</div>
        </div>
      )}
    </div>
  )
}