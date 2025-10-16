'use client'

import { useState, useRef, useEffect } from 'react'

interface SimpleImageCropperProps {
  imageUrl: string
  onCropComplete: (croppedBlob: Blob) => void
  onCancel: () => void
  aspectRatio?: number // width/height ratio, e.g., 1 for square, 16/9 for landscape
  fallbackFile?: File // Optional fallback if URL fails
}

export default function SimpleImageCropper({
  imageUrl,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  fallbackFile
}: SimpleImageCropperProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [fallbackDataUrl, setFallbackDataUrl] = useState<string | null>(null)

  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log('ImageCropper mounted with URL:', imageUrl)

    // Reset states when imageUrl changes
    setImageLoaded(false)
    setError(null)
    setFallbackDataUrl(null)

    // Validate URL format
    if (!imageUrl || (!imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:') && !imageUrl.startsWith('http'))) {
      console.error('Invalid image URL format:', imageUrl)
      setError('Invalid image URL format')
      return
    }

    // Try to preload the image to detect issues early
    const preloadImg = new Image()
    let imageLoadTimeout: NodeJS.Timeout
    let hasLoaded = false

    const handlePreloadSuccess = () => {
      console.log('Image preload successful')
      hasLoaded = true
      clearTimeout(imageLoadTimeout)
    }

    const handlePreloadError = () => {
      console.error('Image preload failed for URL:', imageUrl)
      if (!hasLoaded && fallbackFile && !fallbackDataUrl) {
        console.log('Attempting FileReader fallback due to preload failure...')
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setFallbackDataUrl(event.target.result as string)
            console.log('FileReader fallback created from preload failure')
          }
        }
        reader.onerror = () => {
          console.error('FileReader fallback also failed in preload')
          setError('Failed to load image for cropping. The image may be corrupted or too large.')
        }
        reader.readAsDataURL(fallbackFile)
      } else if (!hasLoaded) {
        setError('Failed to load image for cropping. The image may be corrupted or too large.')
      }
    }

    // Set up preload handlers
    preloadImg.onload = handlePreloadSuccess
    preloadImg.onerror = handlePreloadError

    // Set a more generous timeout for image loading
    imageLoadTimeout = setTimeout(() => {
      if (!hasLoaded && !imageLoaded) {
        console.error('Image loading timeout for URL:', imageUrl)
        handlePreloadError()
      }
    }, 30000) // 30 second timeout (increased from 15)

    // Start preloading
    preloadImg.src = imageUrl

    return () => {
      clearTimeout(imageLoadTimeout)
      preloadImg.onload = null
      preloadImg.onerror = null
      preloadImg.src = ''
    }
  }, [imageUrl, fallbackFile, fallbackDataUrl, imageLoaded])

  const handleImageLoad = () => {
    const img = imageRef.current
    console.log('Image loaded successfully', {
      naturalWidth: img?.naturalWidth,
      naturalHeight: img?.naturalHeight,
      clientWidth: img?.clientWidth,
      clientHeight: img?.clientHeight
    })

    setImageLoaded(true)
    setError(null)

    // Initialize crop area in center (with a small delay to ensure image is fully rendered)
    setTimeout(() => {
      const img = imageRef.current
      if (img && img.clientWidth > 0 && img.clientHeight > 0) {
        const containerWidth = img.clientWidth
        const containerHeight = img.clientHeight

        // Calculate crop size based on aspect ratio
        let cropWidth = Math.min(containerWidth * 0.8, 300)
        let cropHeight = cropWidth / aspectRatio

        if (cropHeight > containerHeight * 0.8) {
          cropHeight = containerHeight * 0.8
          cropWidth = cropHeight * aspectRatio
        }

        setCrop({
          x: (containerWidth - cropWidth) / 2,
          y: (containerHeight - cropHeight) / 2,
          width: cropWidth,
          height: cropHeight
        })
      }
    }, 100)
  }

  const handleImageError = (e: any) => {
    console.error('Main image failed to load:', {
      error: e,
      src: imageUrl,
      currentTarget: e.currentTarget,
      naturalWidth: e.currentTarget?.naturalWidth,
      naturalHeight: e.currentTarget?.naturalHeight,
      complete: e.currentTarget?.complete
    })

    // Only set error if we're not already using fallback
    if (!fallbackDataUrl) {
      // Try fallback with FileReader if we have the original file
      if (fallbackFile) {
        console.log('Main image failed, attempting FileReader fallback...')
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setFallbackDataUrl(event.target.result as string)
            console.log('FileReader fallback created successfully')
            setError(null) // Clear any previous error
          }
        }
        reader.onerror = () => {
          console.error('FileReader fallback also failed')
          setError('Failed to load image for cropping. The image may be corrupted or too large.')
          setImageLoaded(false)
        }
        reader.readAsDataURL(fallbackFile)
      } else {
        setError('Failed to load image for cropping. Please try a different image.')
        setImageLoaded(false)
      }
    } else {
      // If fallback also fails, show error
      console.error('Fallback image also failed to load')
      setError('Failed to load image for cropping. The image may be corrupted or too large.')
      setImageLoaded(false)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - crop.x,
      y: e.clientY - crop.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return

    const img = imageRef.current
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
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleCrop = () => {
    const img = imageRef.current
    const canvas = canvasRef.current

    if (!img || !canvas) {
      console.error('Missing image or canvas element')
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

    // Set canvas size to crop size
    canvas.width = crop.width * scaleX
    canvas.height = crop.height * scaleY

    // Draw cropped image
    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        console.log('Crop completed successfully')
        onCropComplete(blob)
      } else {
        console.error('Failed to create blob from canvas')
        setError('Failed to process cropped image')
      }
    }, 'image/jpeg', 0.9)
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
            {error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-lg">{error}</div>
                <p className="text-gray-500 mt-2">Please try with a different image</p>
              </div>
            ) : !imageLoaded ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading image...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Image with crop overlay */}
                <div
                  ref={containerRef}
                  className="relative inline-block max-w-full max-h-96 mx-auto"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img
                    ref={imageRef}
                    src={fallbackDataUrl || imageUrl}
                    alt="Crop preview"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    className="max-w-full max-h-96 object-contain"
                    crossOrigin="anonymous"
                    draggable={false}
                    style={{ display: imageLoaded ? 'block' : 'none' }}
                  />

                  {/* Crop overlay */}
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 cursor-move"
                    style={{
                      left: crop.x,
                      top: crop.y,
                      width: crop.width,
                      height: crop.height
                    }}
                    onMouseDown={handleMouseDown}
                  >
                    {/* Corner handles */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 cursor-nw-resize"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 cursor-ne-resize"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 cursor-sw-resize"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize"></div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-center text-sm text-gray-500">
                  Drag the blue area to position your crop
                </div>
              </div>
            )}

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
                disabled={!imageLoaded || error !== null}
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