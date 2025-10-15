// Image optimization utilities to prevent website slowdowns

export interface OptimizedImages {
  original: string
  optimized: string
  thumbnail: string
}

export interface ImageUploadOptions {
  quality?: number // 0.1 to 1.0
  maxWidth?: number
  maxHeight?: number
  thumbnailSize?: number
}

// Compress and optimize images client-side before upload
export function optimizeImageFile(
  file: File,
  options: ImageUploadOptions = {}
): Promise<{ optimized: File; thumbnail: File }> {
  const {
    quality = 0.8,
    maxWidth = 1200,
    maxHeight = 1200,
    thumbnailSize = 300
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      try {
        // Calculate optimized dimensions
        let { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight)

        // Create optimized image
        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob((optimizedBlob) => {
          if (!optimizedBlob) {
            reject(new Error('Failed to create optimized image'))
            return
          }

          // Create thumbnail
          const thumbDimensions = calculateDimensions(img.width, img.height, thumbnailSize, thumbnailSize)
          canvas.width = thumbDimensions.width
          canvas.height = thumbDimensions.height
          ctx?.drawImage(img, 0, 0, thumbDimensions.width, thumbDimensions.height)

          canvas.toBlob((thumbnailBlob) => {
            if (!thumbnailBlob) {
              reject(new Error('Failed to create thumbnail'))
              return
            }

            const optimizedFile = new File([optimizedBlob], `optimized_${file.name}`, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })

            const thumbnailFile = new File([thumbnailBlob], `thumb_${file.name}`, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })

            resolve({ optimized: optimizedFile, thumbnail: thumbnailFile })
          }, 'image/jpeg', quality * 0.7) // Lower quality for thumbnails
        }, 'image/jpeg', quality)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let { width, height } = { width: originalWidth, height: originalHeight }

  // Scale down if necessary
  if (width > maxWidth) {
    height = (height * maxWidth) / width
    width = maxWidth
  }

  if (height > maxHeight) {
    width = (width * maxHeight) / height
    height = maxHeight
  }

  return { width: Math.round(width), height: Math.round(height) }
}

// Validate image file before upload
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 10MB'
    }
  }

  return { valid: true }
}

// Generate optimized URLs for different use cases
export function getOptimizedImageUrl(url: string, type: 'thumbnail' | 'medium' | 'large' = 'medium'): string {
  if (!url) return ''

  // If using external image services like Cloudinary, Vercel Image Optimization, etc.
  const baseUrl = url

  // For Vercel's Image Optimization API
  const sizes = {
    thumbnail: 'w=300&q=75',
    medium: 'w=800&q=80',
    large: 'w=1200&q=85'
  }

  // Check if it's a relative URL or external
  if (url.startsWith('/') || url.includes(process.env.NEXT_PUBLIC_SITE_URL || '')) {
    return `/_next/image?url=${encodeURIComponent(baseUrl)}&${sizes[type]}`
  }

  // For external URLs, return as-is (assume they're already optimized)
  return url
}

// Create a progressive loading effect
export function createProgressiveImage(
  thumbnailUrl: string,
  fullUrl: string,
  onLoad?: () => void
): HTMLImageElement {
  const img = new Image()
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // Load thumbnail first
  const thumbImg = new Image()
  thumbImg.onload = () => {
    // Show blurred thumbnail immediately
    canvas.width = thumbImg.width
    canvas.height = thumbImg.height
    ctx?.drawImage(thumbImg, 0, 0)
    ctx && (ctx.filter = 'blur(5px)')

    // Start loading full image
    img.src = fullUrl
  }

  img.onload = () => {
    // Replace with sharp full image
    canvas.width = img.width
    canvas.height = img.height
    ctx && (ctx.filter = 'none')
    ctx?.drawImage(img, 0, 0)
    onLoad?.()
  }

  thumbImg.src = thumbnailUrl
  return img
}