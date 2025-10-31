'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ModernImageCropper from './ModernImageCropper'
import { processImageFileWithFallback, isHeicFile } from '@/lib/heicConverterBrowser'

interface ProductImage {
  id?: string
  url: string
  alt_text?: string
  is_primary: boolean
  sort_order: number
  uploading?: boolean
  file?: File
  isLocal?: boolean
}

interface ModernImageUploadProps {
  images: ProductImage[]
  onImagesChange: (images: ProductImage[]) => void
  maxImages?: number
  productName?: string
}

export default function ModernImageUpload({
  images = [],
  onImagesChange,
  maxImages = 8,
  productName = ''
}: ModernImageUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File) => {
    // Size check (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB'
    }

    // Type check
    if (!file.type.startsWith('image/') && !isHeicFile(file)) {
      return 'Please select an image file'
    }

    return null
  }, [])

  const processFile = useCallback(async (file: File) => {
    const validation = validateFile(file)
    if (validation) {
      setError(validation)
      return
    }

    setError(null)
    setProcessing(true)

    try {
      console.log('Processing file:', file.name, file.type, file.size)

      // For all files (including HEIC), let the cropper handle them
      setCurrentFile(file)

      setShowCropper(true)
    } catch (error) {
      console.error('Error processing file:', error)
      setError('Failed to process image. Please try again.')
    } finally {
      setProcessing(false)
    }
  }, [validateFile])

  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)

    if (fileArray.length === 0) return

    // Check if we have room for more images
    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    // For now, process one file at a time for cropping
    const file = fileArray[0]
    processFile(file)
  }, [images.length, maxImages, processFile])

  const handleCropComplete = useCallback((croppedBlob: Blob) => {
    if (!currentFile) return

    try {
      // Create a new file from the cropped blob
      const croppedFile = new File([croppedBlob], currentFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      })

      // Create preview URL
      const previewUrl = URL.createObjectURL(croppedBlob)

      // Create new image object
      const newImage: ProductImage = {
        url: previewUrl,
        alt_text: `${productName} - Image ${images.length + 1}`,
        is_primary: images.length === 0, // First image is primary
        sort_order: images.length,
        file: croppedFile,
        isLocal: true
      }

      // Add to images array
      onImagesChange([...images, newImage])

      // Reset state
      setCurrentFile(null)
      setShowCropper(false)
      setError(null)

      console.log('Image added successfully')
    } catch (error) {
      console.error('Error handling cropped image:', error)
      setError('Failed to process cropped image')
    }
  }, [currentFile, images, onImagesChange, productName])

  const handleCropCancel = useCallback(() => {
    setCurrentFile(null)
    setShowCropper(false)
    setError(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const removeImage = useCallback((index: number) => {
    const newImages = [...images]
    const removedImage = newImages.splice(index, 1)[0]

    // Clean up blob URL if it's local
    if (removedImage.isLocal && removedImage.url.startsWith('blob:')) {
      URL.revokeObjectURL(removedImage.url)
    }

    // If we removed the primary image, make the first remaining image primary
    if (removedImage.is_primary && newImages.length > 0) {
      newImages[0].is_primary = true
    }

    // Update sort orders
    newImages.forEach((img, idx) => {
      img.sort_order = idx
    })

    onImagesChange(newImages)
  }, [images, onImagesChange])

  const setPrimaryImage = useCallback((index: number) => {
    const newImages = images.map((img, idx) => ({
      ...img,
      is_primary: idx === index
    }))
    onImagesChange(newImages)
  }, [images, onImagesChange])


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Product Images ({images.length}/{maxImages})
        </h3>
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
          >
            + Add Image
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border"
            >
              <img
                src={image.url}
                alt={image.alt_text}
                className="w-full h-full object-cover"
              />

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col space-y-1">
                {image.is_primary && (
                  <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
              </div>

              {/* Controls overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2">
                <div className="flex space-x-2">
                  {!image.is_primary && (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className="bg-white text-gray-900 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
                    >
                      Set Primary
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            processing
              ? 'border-blue-400 bg-blue-50'
              : dragOver
              ? 'border-blue-400 bg-blue-50'
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
                  <p className="text-lg font-medium text-blue-700">Processing image...</p>
                  <p className="text-sm text-blue-600 mt-2">Preparing your image for cropping</p>
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
                    Supports JPEG, PNG, WebP, HEIC (max 10MB)
                  </p>
                </div>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            onChange={(e) => {
              if (e.target.files) {
                handleFileSelect(e.target.files)
              }
            }}
            className="hidden"
            disabled={processing}
          />
        </div>
      )}

      {/* Info */}
      <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p className="font-medium mb-2">📝 Upload Guidelines:</p>
        <ul className="space-y-1">
          <li>• Maximum {maxImages} images per product</li>
          <li>• Supported formats: JPEG, PNG, WebP, HEIC</li>
          <li>• Maximum file size: 10MB per image</li>
          <li>• Images will be cropped to square format</li>
          <li>• First uploaded image becomes the primary image</li>
          <li>• <span className="text-green-600 font-medium">📦 Product images</span> are shown on product pages</li>
          <li>• <span className="text-purple-600 font-medium">🎨 Color images</span> can be assigned to specific color variants</li>
          <li>• Click the assignment button on hover to switch between Product/Color</li>
          <li>• Images are uploaded when you save the product</li>
        </ul>
      </div>

      {/* Cropper Modal */}
      {showCropper && currentFile && (
        <ModernImageCropper
          file={currentFile}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1} // Square crop for product images
        />
      )}
    </div>
  )
}