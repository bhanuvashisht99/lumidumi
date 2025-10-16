'use client'

import { useState, useCallback, useRef } from 'react'
import { validateImageFile, optimizeImageFile } from '@/lib/imageOptimization'
import { processImageFile } from '@/lib/heicConverter'
import ImageCropper from './ImageCropper'

interface ProductImage {
  id?: string
  url: string
  alt_text?: string
  is_primary: boolean
  sort_order: number
  uploading?: boolean
}

interface MultiImageUploadProps {
  images: ProductImage[]
  onImagesChange: (images: ProductImage[]) => void
  maxImages?: number
  productName?: string
}

export default function MultiImageUpload({
  images = [],
  onImagesChange,
  maxImages = 8,
  productName = ''
}: MultiImageUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [cropperImage, setCropperImage] = useState<string | null>(null)
  const [cropperFile, setCropperFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const remainingSlots = maxImages - images.length

    if (fileArray.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s)`)
      return
    }

    // For single file selection, show cropper
    if (fileArray.length === 1) {
      const file = fileArray[0]

      console.log('Single file selected for cropping:', file)

      try {
        // Process HEIC files first (converts to JPEG if needed)
        const processedFile = await processImageFile(file)
        console.log('File processed successfully:', processedFile.name, processedFile.type)

        const validation = validateImageFile(processedFile)
        console.log('Validation result:', validation)

        if (!validation.valid) {
          alert(`Error with ${processedFile.name}: ${validation.error}`)
          return
        }

        // Use the processed file for further operations
        const finalFile = processedFile

        console.log('Creating blob URL for processed file:', {
          name: finalFile.name,
          type: finalFile.type,
          size: finalFile.size,
          lastModified: finalFile.lastModified
        })

        // Additional file validation
        if (finalFile.size === 0) {
          alert('The selected file appears to be empty. Please choose a different image.')
          return
        }

        if (finalFile.size > 50 * 1024 * 1024) { // 50MB limit
          alert('File is too large. Please choose an image smaller than 50MB.')
          return
        }

        // Clean up any existing blob URL
        if (cropperImage && cropperImage.startsWith('blob:')) {
          URL.revokeObjectURL(cropperImage)
        }

        const blobUrl = URL.createObjectURL(finalFile)
        console.log('Created blob URL:', blobUrl)

        // Test if the blob URL is valid by creating a test image
        const testImg = new Image()
        testImg.onload = () => {
          console.log('Blob URL test successful')
          setCropperFile(finalFile)
          setCropperImage(blobUrl)
        }
        testImg.onerror = (e) => {
          console.error('Blob URL test failed, trying FileReader:', e)
          URL.revokeObjectURL(blobUrl)

          // Fallback to FileReader data URL
          const reader = new FileReader()
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string
            if (dataUrl) {
              console.log('FileReader data URL created successfully, length:', dataUrl.length)

              // Test the data URL before using it
              const testDataImg = new Image()
              testDataImg.onload = () => {
                console.log('Data URL test successful')
                setCropperFile(finalFile)
                setCropperImage(dataUrl)
              }
              testDataImg.onerror = (e) => {
                console.error('Data URL test failed:', e)
                // Last resort: try to use the data URL anyway, maybe the cropper can handle it
                console.log('Attempting to use data URL despite test failure...')
                setCropperFile(finalFile)
                setCropperImage(dataUrl)
              }
              testDataImg.src = dataUrl
            } else {
              console.error('FileReader result is empty')
              alert('Failed to create image preview. Please try a different image.')
            }
          }
          reader.onerror = (e) => {
            console.error('FileReader failed:', e)
            alert('Failed to read image file. Please try a different image.')
          }
          reader.readAsDataURL(finalFile)
        }
        testImg.src = blobUrl

        return

      } catch (error) {
        console.error('Error processing image file:', error)
        alert(error instanceof Error ? error.message : 'Failed to process image file')
        return
      }
    }

    // For multiple files, process without cropping
    await processFiles(fileArray)
  }, [images, maxImages])

  const processFiles = useCallback(async (fileArray: File[]) => {
    setUploading(true)
    const newImages: ProductImage[] = []

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      const validation = validateImageFile(file)

      if (!validation.valid) {
        alert(`Error with ${file.name}: ${validation.error}`)
        continue
      }

      try {
        // Optimize image before upload
        const { optimized, thumbnail } = await optimizeImageFile(file, {
          quality: 0.85,
          maxWidth: 1200,
          maxHeight: 1200,
          thumbnailSize: 300
        })

        // Upload to server
        const formData = new FormData()
        formData.append('file', optimized)

        const uploadResponse = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image')
        }

        const uploadResult = await uploadResponse.json()

        const newImage: ProductImage = {
          url: uploadResult.url,
          alt_text: `${productName} - Image ${images.length + newImages.length + 1}`,
          is_primary: images.length === 0 && newImages.length === 0, // First image is primary
          sort_order: images.length + newImages.length,
          uploading: false
        }

        newImages.push(newImage)
      } catch (error) {
        console.error('Error optimizing image:', error)
        alert(`Failed to process ${file.name}`)
      }
    }

    onImagesChange([...images, ...newImages])
    setUploading(false)
  }, [images, productName, onImagesChange])

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

  const reorderImages = (dragIndex: number, hoverIndex: number) => {
    const newImages = [...images]
    const draggedImage = newImages[dragIndex]

    newImages.splice(dragIndex, 1)
    newImages.splice(hoverIndex, 0, draggedImage)

    // Update sort orders
    newImages.forEach((img, idx) => {
      img.sort_order = idx
    })

    onImagesChange(newImages)
  }

  const handleCropComplete = useCallback(async (croppedImageBlob: Blob) => {
    if (!cropperFile) return

    try {
      // Convert blob to file
      const croppedFile = new File([croppedImageBlob], cropperFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      })

      // Process the cropped file
      await processFiles([croppedFile])

      // Clean up cropper state and revoke blob URL (only if it's a blob URL)
      if (cropperImage && cropperImage.startsWith('blob:')) {
        URL.revokeObjectURL(cropperImage)
      }
      setCropperImage(null)
      setCropperFile(null)
    } catch (error) {
      console.error('Error processing cropped image:', error)
      alert('Failed to process cropped image')
    }
  }, [cropperFile, processFiles, cropperImage])

  const handleCropCancel = useCallback(() => {
    if (cropperImage && cropperImage.startsWith('blob:')) {
      URL.revokeObjectURL(cropperImage)
    }
    setCropperImage(null)
    setCropperFile(null)
  }, [cropperImage])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-charcoal">
          Product Images ({images.length}/{maxImages})
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm text-cream-300 hover:text-cream-300/80 font-medium"
          disabled={images.length >= maxImages || uploading}
        >
          + Add Images
        </button>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group aspect-square bg-cream-100 rounded-lg overflow-hidden border-2 border-dashed border-cream-200 hover:border-cream-300 transition-colors"
          >
            <img
              src={image.url}
              alt={image.alt_text}
              className="w-full h-full object-cover"
            />

            {/* Primary badge */}
            {image.is_primary && (
              <div className="absolute top-2 left-2 bg-cream-300 text-white text-xs px-2 py-1 rounded">
                Primary
              </div>
            )}

            {/* Controls overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              {!image.is_primary && (
                <button
                  type="button"
                  onClick={() => setPrimaryImage(index)}
                  className="bg-white text-charcoal px-2 py-1 rounded text-xs font-medium hover:bg-cream-50 transition-colors"
                >
                  Set Primary
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>

            {/* Drag handles for reordering */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                className="bg-charcoal/70 text-white p-1 rounded cursor-move"
                title="Drag to reorder"
              >
                ⋮⋮
              </button>
            </div>
          </div>
        ))}

        {/* Upload placeholder */}
        {images.length < maxImages && (
          <div
            className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-cream-300 bg-cream-50'
                : 'border-cream-200 hover:border-cream-300'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cream-300 mx-auto mb-2"></div>
                <p className="text-xs text-charcoal/60">Processing...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl text-charcoal/40 mb-2">📷</div>
                <p className="text-xs text-charcoal/60">
                  Drop images here<br />or click to upload
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => {
          if (e.target.files) {
            handleFileSelect(e.target.files)
          }
        }}
        className="hidden"
      />

      {/* Image optimization info */}
      <div className="text-xs text-charcoal/50 bg-cream-50 p-3 rounded-lg">
        <p className="font-medium mb-1">📈 Image Optimization:</p>
        <ul className="space-y-1">
          <li>• Images are automatically compressed to optimal size</li>
          <li>• Maximum size: 10MB per image</li>
          <li>• Supported formats: JPEG, PNG, WebP, HEIC</li>
          <li>• HEIC files are automatically converted to JPEG</li>
          <li>• First image becomes the primary product image</li>
          <li>• Single images can be cropped before upload</li>
        </ul>
      </div>

      {/* Image Cropper Modal */}
      {cropperImage && (
        <ImageCropper
          src={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1} // Square crop for product images
          minWidth={200}
          minHeight={200}
        />
      )}
    </div>
  )
}