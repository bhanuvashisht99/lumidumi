'use client'

import { useState, useCallback } from 'react'
import SimpleImageUpload from './SimpleImageUpload'
import SimpleImageCropper from './SimpleImageCropper'

interface ProductImage {
  id?: string
  url: string
  alt_text?: string
  is_primary: boolean
  sort_order: number
  uploading?: boolean
  // Local file support
  file?: File  // Original file for uploading later
  isLocal?: boolean  // Whether this is a local file or server URL
}

interface NewImageUploadProps {
  images: ProductImage[]
  onImagesChange: (images: ProductImage[]) => void
  maxImages?: number
  productName?: string
}

export default function NewImageUpload({
  images = [],
  onImagesChange,
  maxImages = 8,
  productName = ''
}: NewImageUploadProps) {
  const [cropperFile, setCropperFile] = useState<File | null>(null)
  const [cropperPreviewUrl, setCropperPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = useCallback((file: File, previewUrl: string) => {
    console.log('Image selected for cropping:', file.name, file.type, file.size)
    console.log('Preview URL created:', previewUrl)
    setCropperFile(file)
    setCropperPreviewUrl(previewUrl)
  }, [])

  const handleCropComplete = useCallback(async (croppedBlob: Blob) => {
    if (!cropperFile) return

    try {
      // Convert blob to file
      const croppedFile = new File([croppedBlob], cropperFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      })

      console.log('Cropped file created:', croppedFile.name, croppedFile.type, croppedFile.size)

      // Create local preview URL instead of uploading immediately
      const previewUrl = URL.createObjectURL(croppedBlob)

      // Create new image object with local file
      const newImage: ProductImage = {
        url: previewUrl,
        alt_text: `${productName} - Image ${images.length + 1}`,
        is_primary: images.length === 0, // First image is primary
        sort_order: images.length,
        uploading: false,
        file: croppedFile, // Store the file for later upload
        isLocal: true
      }

      // Add to images array
      onImagesChange([...images, newImage])

      // Clean up
      if (cropperPreviewUrl) {
        URL.revokeObjectURL(cropperPreviewUrl)
      }
      setCropperFile(null)
      setCropperPreviewUrl(null)

    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [cropperFile, cropperPreviewUrl, images, productName, onImagesChange])

  const handleCropCancel = useCallback(() => {
    if (cropperPreviewUrl) {
      URL.revokeObjectURL(cropperPreviewUrl)
    }
    setCropperFile(null)
    setCropperPreviewUrl(null)
  }, [cropperPreviewUrl])

  const removeImage = (index: number) => {
    const newImages = [...images]
    const removedImage = newImages.splice(index, 1)[0]

    // If we removed the primary image, make the first remaining image primary
    if (removedImage.is_primary && newImages.length > 0) {
      newImages[0].is_primary = true
    }

    // Update sort orders
    newImages.forEach((img, idx) => {
      img.sort_order = idx
    })

    onImagesChange(newImages)
  }

  const setPrimaryImage = (index: number) => {
    const newImages = images.map((img, idx) => ({
      ...img,
      is_primary: idx === index
    }))
    onImagesChange(newImages)
  }

  if (uploading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Uploading image...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Product Images ({images.length}/{maxImages})
        </h3>
      </div>

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

              {/* Primary badge */}
              {image.is_primary && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}

              {/* Controls overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                {!image.is_primary && (
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(index)}
                    className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
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
        <SimpleImageUpload
          onImageUpload={handleImageUpload}
          maxSize={10}
          accept="image/*"
        />
      )}

      {/* Cropper Modal */}
      {cropperPreviewUrl && (
        <SimpleImageCropper
          imageUrl={cropperPreviewUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1} // Square crop for product images
          fallbackFile={cropperFile || undefined}
        />
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
        </ul>
      </div>
    </div>
  )
}