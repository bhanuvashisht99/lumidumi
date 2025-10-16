'use client'

import { useState, useRef } from 'react'
import { processImageFile, HeicConversionError } from '@/lib/heicConverter'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)

    // Basic validation
    if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.heic') && !file.name.toLowerCase().endsWith('.heif')) {
      setError('Please select an image file')
      return
    }

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    try {
      // Process the file (handles HEIC conversion if needed)
      console.log('Processing file:', file.name, file.type)
      const processedFile = await processImageFile(file)
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
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-4">
          <div className="text-4xl">📷</div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              Drop your image here or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports JPEG, PNG, WebP, HEIC (max {maxSize}MB)
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}