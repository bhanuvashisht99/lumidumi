'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ImageUploadProps {
  currentImage?: string
  onImageUploaded: (url: string) => void
  productName?: string
}

export default function ImageUpload({ currentImage, onImageUploaded, productName }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadImage = async (file: File) => {
    try {
      setUploading(true)
      setUploadProgress(0)

      // Create a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${productName?.toLowerCase().replace(/\s+/g, '-') || 'product'}-${Date.now()}.${fileExt}`

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl

      // Call the callback with the new URL
      onImageUploaded(publicUrl)

      console.log('Image uploaded successfully:', publicUrl)
      setUploadProgress(100)

    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image. Please try again.')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    uploadImage(file)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {/* Current Image Preview */}
        {currentImage && (
          <div className="w-20 h-20 rounded-lg overflow-hidden border border-cream-200">
            <img
              src={currentImage}
              alt="Current product image"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Upload Button */}
        <div className="flex-1">
          <label
            htmlFor="image-upload"
            className={`
              inline-flex items-center px-4 py-2 border border-cream-300 rounded-lg shadow-sm text-sm font-medium text-charcoal bg-white hover:bg-cream-50 focus:outline-none focus:ring-2 focus:ring-cream-300 cursor-pointer
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-charcoal mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                📷 Upload Image
              </>
            )}
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="w-full bg-cream-200 rounded-full h-2">
          <div
            className="bg-cream-300 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {/* Instructions */}
      <p className="text-xs text-charcoal/60">
        Supported formats: JPG, PNG, WebP. Max size: 5MB
      </p>
    </div>
  )
}