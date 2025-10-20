'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { isHeicFile, processImageFileWithFallback } from '@/lib/heicConverterBrowser'

interface ModernImageCropperProps {
  file: File
  onCropComplete: (croppedBlob: Blob) => void
  onCancel: () => void
  aspectRatio?: number
}

export default function ModernImageCropper({
  file,
  onCropComplete,
  onCancel,
  aspectRatio = 1
}: ModernImageCropperProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Create image URL from file
  useEffect(() => {
    let objectUrl: string | null = null

    const processFile = async () => {
      try {
        console.log('Processing file for cropper:', file.name, file.type, file.size)

        // Check if it's a HEIC file and convert it first
        if (isHeicFile(file)) {
          console.log('🔄 HEIC file detected, attempting conversion...')
          setError(null)
          setImageLoaded(false)
          setIsConverting(true)

          try {
            const convertedFile = await processImageFileWithFallback(file)
            console.log('✅ HEIC conversion successful in cropper')

            // Create object URL with converted file
            objectUrl = URL.createObjectURL(convertedFile)
            setImageUrl(objectUrl)
            setIsConverting(false)
            console.log('Updated image URL with converted HEIC file')
          } catch (conversionError) {
            console.error('❌ HEIC conversion failed in cropper:', conversionError)
            setIsConverting(false)

            // Check if it's our custom HeicConversionError
            if (conversionError instanceof Error && conversionError.message.includes('HEIC files')) {
              setError(conversionError.message)
            } else {
              setError('HEIC files are not supported. Please convert to JPEG first:\n\n• iPhone Users: Open Photos app → Select image → Share → Save as JPEG\n• Or change iPhone camera settings: Settings → Camera → Formats → Most Compatible\n• Online converter: Search "HEIC to JPEG converter" in your browser')
            }
            return
          }
        } else {
          // For non-HEIC files, create URL directly
          console.log('Creating object URL for non-HEIC file:', file.name, file.type, file.size)
          objectUrl = URL.createObjectURL(file)
          setImageUrl(objectUrl)
          setImageLoaded(false) // Reset loaded state
          setError(null)
          console.log('Local file URL created:', objectUrl)

          // Force a check if the image loads immediately for some file types
          setTimeout(() => {
            if (imageRef.current && !imageLoaded) {
              console.log('Checking if image loaded after timeout...')
              if (imageRef.current.complete && imageRef.current.naturalWidth > 0) {
                console.log('Image was already loaded, triggering manual load')
                setImageLoaded(true)
                setError(null)
              }
            }
          }, 100)
        }
      } catch (error) {
        console.error('Error processing file:', error)
        setError('Failed to process image')
      }
    }

    processFile()

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [file])

  const handleImageLoad = useCallback(() => {
    const img = imageRef.current
    if (!img) {
      console.error('Image ref is null on load')
      return
    }

    console.log('Image loaded successfully:', {
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      clientWidth: img.clientWidth,
      clientHeight: img.clientHeight,
      src: img.src.substring(0, 50) + '...',
      complete: img.complete
    })

    setImageLoaded(true)
    setError(null)

    // Initialize crop after image is loaded and rendered
    const initializeCrop = () => {
      const img = imageRef.current
      if (!img) return

      // Use natural dimensions if client dimensions aren't available yet
      const containerWidth = img.clientWidth > 0 ? img.clientWidth : Math.min(img.naturalWidth, 400)
      const containerHeight = img.clientHeight > 0 ? img.clientHeight : Math.min(img.naturalHeight, 400)

      if (containerWidth === 0 || containerHeight === 0) {
        console.warn('Image has zero dimensions, retrying...')
        setTimeout(initializeCrop, 50)
        return
      }

      let cropWidth = Math.min(containerWidth * 0.6, 250)
      let cropHeight = cropWidth / aspectRatio

      if (cropHeight > containerHeight * 0.6) {
        cropHeight = containerHeight * 0.6
        cropWidth = cropHeight * aspectRatio
      }

      setCrop({
        x: (containerWidth - cropWidth) / 2,
        y: (containerHeight - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight
      })

      console.log('Crop initialized:', {
        x: (containerWidth - cropWidth) / 2,
        y: (containerHeight - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
        containerWidth,
        containerHeight
      })
    }

    // Initialize crop after a small delay to ensure DOM is ready
    setTimeout(initializeCrop, 10)
  }, [aspectRatio])

  const handleImageError = useCallback((e: any) => {
    console.error('Image failed to load:', {
      error: e,
      fileType: file.type,
      fileName: file.name,
      fileSize: file.size
    })

    // Since we now handle HEIC conversion upfront, this is likely a different issue
    if (isHeicFile(file)) {
      setError('HEIC conversion failed. Please convert to JPEG manually:\n\n• iPhone Users: Open Photos app → Select image → Share → Save as JPEG\n• Or change iPhone camera settings: Settings → Camera → Formats → Most Compatible\n• Online converter: Search "HEIC to JPEG converter" in your browser')
    } else {
      setError('Failed to load image. The file may be corrupted or in an unsupported format.')
    }

    setImageLoaded(false)
  }, [file])

  const handleMouseDown = useCallback((e: React.MouseEvent, action: 'drag' | 'resize') => {
    e.preventDefault()

    if (action === 'drag') {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - crop.x,
        y: e.clientY - crop.y
      })
    } else {
      setIsResizing('se') // Simple resize from southeast corner
      setDragStart({
        x: e.clientX,
        y: e.clientY
      })
    }
  }, [crop])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current) return

    const img = imageRef.current
    const rect = img.getBoundingClientRect()

    if (isDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y

      // Keep crop within image bounds
      const maxX = img.clientWidth - crop.width
      const maxY = img.clientHeight - crop.height

      setCrop(prev => ({
        ...prev,
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      }))
    } else if (isResizing) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      let newWidth = crop.width + deltaX
      let newHeight = newWidth / aspectRatio

      // Keep within bounds
      const maxWidth = img.clientWidth - crop.x
      const maxHeight = img.clientHeight - crop.y

      if (newWidth > maxWidth) {
        newWidth = maxWidth
        newHeight = newWidth / aspectRatio
      }

      if (newHeight > maxHeight) {
        newHeight = maxHeight
        newWidth = newHeight * aspectRatio
      }

      // Minimum size
      if (newWidth < 50) {
        newWidth = 50
        newHeight = newWidth / aspectRatio
      }

      setCrop(prev => ({
        ...prev,
        width: newWidth,
        height: newHeight
      }))

      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }, [isDragging, isResizing, dragStart, crop, aspectRatio])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(null)
  }, [])

  const handleCrop = useCallback(() => {
    const img = imageRef.current
    const canvas = canvasRef.current

    if (!img || !canvas || !imageLoaded) {
      console.error('Missing image or canvas')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Could not get canvas context')
      return
    }

    // Calculate scaling factors
    const scaleX = img.naturalWidth / img.clientWidth
    const scaleY = img.naturalHeight / img.clientHeight

    // Set canvas size to desired output size (fixed size for consistency)
    const outputSize = 400
    canvas.width = outputSize
    canvas.height = outputSize

    console.log('Cropping with:', {
      crop,
      scaleX,
      scaleY,
      naturalSize: { width: img.naturalWidth, height: img.naturalHeight },
      displaySize: { width: img.clientWidth, height: img.clientHeight }
    })

    // Draw cropped and scaled image
    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize
    )

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        console.log('Crop completed, blob size:', blob.size)
        onCropComplete(blob)
      } else {
        console.error('Failed to create blob')
        setError('Failed to process cropped image')
      }
    }, 'image/jpeg', 0.9)
  }, [crop, imageLoaded, onCropComplete])

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full">
          <div className="flex items-center mb-4">
            <div className="text-red-500 text-xl mr-2">⚠️</div>
            <div className="text-red-600 text-lg font-semibold">Image Format Not Supported</div>
          </div>
          <div className="text-gray-700 mb-6 whitespace-pre-line leading-relaxed">
            {error}
          </div>
          <div className="flex justify-center">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Got it, I'll convert the image
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Crop Image</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Loading state */}
            {isConverting && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Converting HEIC file...</p>
                <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
              </div>
            )}
            {!imageLoaded && imageUrl && !isConverting && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading image...</p>
              </div>
            )}

            {/* Image container */}
            <div className="space-y-4">
              {/* Image with crop overlay */}
              <div
                ref={containerRef}
                className="relative flex justify-center bg-gray-100 p-4 rounded-lg min-h-[300px]"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: isDragging ? 'grabbing' : 'default' }}
              >
                {imageUrl && (
                  <>
                    <img
                      ref={imageRef}
                      src={imageUrl}
                      alt="Crop preview"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      className="max-w-full max-h-96 object-contain"
                      draggable={false}
                      style={{ display: 'block' }}
                    />

                      {/* Crop overlay */}
                      {imageLoaded && imageRef.current && (
                        <div
                          className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-10"
                          style={{
                            left: crop.x + imageRef.current.offsetLeft,
                            top: crop.y + imageRef.current.offsetTop,
                            width: crop.width,
                            height: crop.height,
                            cursor: 'move'
                          }}
                          onMouseDown={(e) => handleMouseDown(e, 'drag')}
                        >
                          {/* Resize handle */}
                          <div
                            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize"
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              handleMouseDown(e, 'resize')
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Instructions */}
                {imageLoaded && (
                  <div className="text-center text-sm text-gray-500 space-y-1">
                    <p>Drag the blue area to position your crop</p>
                    <p>Drag the corner handle to resize</p>
                  </div>
                )}
              </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                onClick={onCancel}
                className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCrop}
                disabled={!imageLoaded}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}