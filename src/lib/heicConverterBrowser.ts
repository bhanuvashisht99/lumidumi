// Browser-based HEIC conversion using Canvas API and createImageBitmap

export class HeicConversionError extends Error {
  constructor(message: string, public isHeicFile: boolean = true) {
    super(message)
    this.name = 'HeicConversionError'
  }
}

export function isHeicFile(file: File): boolean {
  const fileName = file.name.toLowerCase()
  const isHeic = fileName.endsWith('.heic') || fileName.endsWith('.heif') ||
         file.type === 'image/heic' || file.type === 'image/heif'

  return isHeic
}

export function isHeicConversionSupported(): boolean {
  return typeof window !== 'undefined' &&
         typeof document !== 'undefined' &&
         'createImageBitmap' in window
}

// Convert HEIC to JPEG using browser APIs
async function convertHeicToJpeg(file: File): Promise<File> {
  console.log('🔧 Starting browser HEIC conversion for:', file.name, file.type)

  // Check browser support first
  const support = {
    hasCreateImageBitmap: 'createImageBitmap' in window,
    hasCanvas: typeof document !== 'undefined' && typeof document.createElement === 'function',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    isSafari: typeof navigator !== 'undefined' && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
    isChrome: typeof navigator !== 'undefined' && /Chrome/.test(navigator.userAgent),
    isFirefox: typeof navigator !== 'undefined' && /Firefox/.test(navigator.userAgent)
  }

  console.log('🔍 Browser support check:', support)

  try {
    // First try: Use heic2any library (most reliable for browser conversion)
    console.log('🎯 Attempting HEIC conversion using heic2any library...')

    // Dynamic import to avoid bundle bloat
    const heic2any = (await import('heic2any')).default

    console.log('📋 Converting HEIC file with heic2any...')
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9
    })

    // heic2any can return a single blob or an array of blobs
    const resultBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob

    if (!(resultBlob instanceof Blob)) {
      throw new Error('heic2any did not return a valid blob')
    }

    const fileName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
    const convertedFile = new File([resultBlob], fileName, {
      type: 'image/jpeg',
      lastModified: file.lastModified
    })

    console.log('🎉 HEIC conversion successful via heic2any:', {
      originalSize: file.size,
      convertedSize: convertedFile.size,
      originalName: file.name,
      convertedName: convertedFile.name
    })

    return convertedFile

  } catch (heic2anyError) {
    console.error('❌ heic2any conversion failed:', heic2anyError)
    console.log('🔄 Fallback: Trying native browser APIs...')

    // Fallback to native browser APIs
    try {
      // First try: createImageBitmap (most likely to work if browser supports HEIC)
      if ('createImageBitmap' in window) {
        console.log('📋 Attempting createImageBitmap conversion (fallback method)...')
        try {
          const imageBitmap = await createImageBitmap(file)
          console.log('✅ ImageBitmap created successfully:', {
            width: imageBitmap.width,
            height: imageBitmap.height
          })

          // Create canvas and draw the image
          const canvas = document.createElement('canvas')
          canvas.width = imageBitmap.width
          canvas.height = imageBitmap.height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            throw new Error('Could not get canvas context')
          }

          console.log('🎨 Drawing ImageBitmap to canvas...')
          ctx.drawImage(imageBitmap, 0, 0)

          // Convert to blob
          console.log('📸 Converting canvas to JPEG blob...')
          return new Promise<File>((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) {
                const fileName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
                const convertedFile = new File([blob], fileName, {
                  type: 'image/jpeg',
                  lastModified: file.lastModified
                })

                console.log('🎉 HEIC conversion successful via createImageBitmap:', {
                  originalSize: file.size,
                  convertedSize: convertedFile.size,
                  originalName: file.name,
                  convertedName: convertedFile.name
                })

                resolve(convertedFile)
              } else {
                reject(new Error('Failed to create JPEG blob from canvas'))
              }
            }, 'image/jpeg', 0.9)
          })
        } catch (bitmapError) {
          console.error('❌ createImageBitmap conversion failed:', bitmapError)
          console.log('🔄 Final fallback: Trying Image element approach...')

          // Final fallback to Image element approach
          return await convertUsingImageElement(file)
        }
      } else {
        console.log('❌ createImageBitmap not supported in this browser')
        console.log('🔄 Trying Image element approach...')

        // Try Image element approach
        return await convertUsingImageElement(file)
      }
    } catch (finalError) {
      console.error('❌ All browser conversion methods failed:', finalError)

      // Provide specific error based on what we attempted
      throw new Error(`Browser HEIC conversion failed: ${finalError instanceof Error ? finalError.message : 'Unknown error'}. HEIC format requires special codecs not available in this browser.`)
    }
  }
}

// Fallback method using Image element
async function convertUsingImageElement(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    console.log('🖼️ Creating Image element for HEIC file...')
    const img = new Image()
    const url = URL.createObjectURL(file)
    console.log('📎 Object URL created:', url.substring(0, 50) + '...')

    img.onload = () => {
      console.log('✅ Image loaded successfully:', {
        width: img.width,
        height: img.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      })

      try {
        // Create canvas and draw the image
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || img.width
        canvas.height = img.naturalHeight || img.height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        console.log('🎨 Drawing image to canvas...')
        ctx.drawImage(img, 0, 0)

        // Convert to blob
        console.log('📸 Converting canvas to JPEG blob...')
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url)

          if (blob) {
            const fileName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
            const convertedFile = new File([blob], fileName, {
              type: 'image/jpeg',
              lastModified: file.lastModified
            })

            console.log('🎉 HEIC conversion successful using Image element:', {
              originalSize: file.size,
              convertedSize: convertedFile.size,
              originalName: file.name,
              convertedName: convertedFile.name
            })

            resolve(convertedFile)
          } else {
            reject(new Error('Failed to create JPEG blob from canvas'))
          }
        }, 'image/jpeg', 0.9)

      } catch (error) {
        console.error('❌ Canvas operation failed:', error)
        URL.revokeObjectURL(url)
        reject(error)
      }
    }

    img.onerror = (error) => {
      console.error('❌ Image failed to load:', error)
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load HEIC image in browser'))
    }

    console.log('⏳ Setting image source to trigger load...')
    img.src = url
  })
}

// Main function that handles all image processing
export async function processImageFileWithFallback(file: File): Promise<File> {
  if (!isHeicFile(file)) {
    console.log('File is not HEIC, returning as-is:', file.type)
    return file
  }

  console.log('🔧 Processing HEIC file:', file.name, file.size)

  try {
    // First try: Server-side conversion with Sharp (most reliable)
    console.log('🚀 Attempting server-side HEIC conversion...')
    const convertedFile = await convertHeicOnServer(file)
    console.log('✅ HEIC conversion successful via server')
    return convertedFile
  } catch (serverError) {
    const errorMessage = serverError instanceof Error ? serverError.message : 'Unknown error'
    console.log('⚠️ Server conversion failed with message:', errorMessage)

    // Check if server specifically suggested fallback to client
    if (errorMessage === 'FALLBACK_TO_CLIENT') {
      console.log('🔄 Server lacks HEIC support, trying browser conversion...')

      try {
        // Fallback: Try our multi-level browser conversion approach
        const convertedFile = await convertHeicToJpeg(file)
        console.log('✅ HEIC conversion successful via browser APIs (server fallback)')
        return convertedFile
      } catch (browserError) {
        console.error('❌ Browser HEIC conversion also failed:', browserError)
        console.error('❌ Browser error type:', typeof browserError)
        console.error('❌ Browser error details:', browserError instanceof Error ? browserError.message : browserError)

        // Provide enhanced guidance when both server and client fail
        throw new HeicConversionError(
          'HEIC files are not supported in this environment. Here are your options:\n\n📱 iPhone/iPad Users:\n• Open Photos app → Select image → Share → "Save as JPEG"\n• Or change camera settings: Settings → Camera → Formats → "Most Compatible"\n\n💻 Convert Online:\n• Search "HEIC to JPEG converter" in your browser\n• Many free converters available (CloudConvert, Convertio, etc.)\n\n🔧 Technical Note:\nHEIC format requires special codecs not available in this browser/server environment.',
          true
        )
      }
    } else {
      // Other server errors - try browser conversion but with more realistic expectations
      console.warn('⚠️ Server HEIC conversion failed, trying browser APIs. Server error:', serverError)

      try {
        // Fallback: Try our multi-level browser conversion approach
        const convertedFile = await convertHeicToJpeg(file)
        console.log('✅ HEIC conversion successful via browser APIs')
        return convertedFile
      } catch (browserError) {
        console.error('❌ Browser HEIC conversion also failed:', browserError)
        console.error('❌ Browser error type:', typeof browserError)
        console.error('❌ Browser error details:', browserError instanceof Error ? browserError.message : browserError)

        // Provide realistic guidance about HEIC limitations
        throw new HeicConversionError(
          'HEIC conversion failed. This format has limited browser support.\n\n📱 Quick Solution for iPhone Users:\n• Photos app → Select image → Share → "Save as JPEG"\n• This creates a compatible copy instantly\n\n⚙️ Prevent Future Issues:\n• Settings → Camera → Formats → "Most Compatible"\n• Your camera will then save photos as JPEG by default\n\n💻 Alternative:\n• Use any online "HEIC to JPEG converter"',
          true
        )
      }
    }
  }
}

async function convertHeicOnServer(file: File): Promise<File> {
  console.log('📤 Sending HEIC file to server for conversion...')
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload/heic-convert', {
    method: 'POST',
    body: formData
  })

  console.log('📥 Server response:', response.status, response.statusText)

  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
      console.log('⚠️ Server error data:', errorData)
    } catch (parseError) {
      console.error('❌ Failed to parse server error response:', parseError)
      throw new Error(`Server responded with status ${response.status}`)
    }

    // If server suggests fallback to client, throw a special error
    if (errorData.fallbackToClient) {
      console.log('🔄 Server suggested fallback to client conversion')
      throw new Error('FALLBACK_TO_CLIENT')
    }

    throw new Error(errorData.error || 'Server conversion failed')
  }

  const result = await response.json()
  console.log('✅ Server conversion result received:', {
    success: result.success,
    originalSize: result.originalSize,
    convertedSize: result.convertedSize,
    compressionRatio: result.compressionRatio
  })

  if (!result.success) {
    throw new Error(result.error || 'Conversion was not successful')
  }

  // Convert the data URL back to a File object
  console.log('🔄 Converting data URL back to File object...')
  const dataUrl = result.convertedFile.dataUrl
  const base64Data = dataUrl.split(',')[1]
  const binaryData = atob(base64Data)
  const bytes = new Uint8Array(binaryData.length)

  for (let i = 0; i < binaryData.length; i++) {
    bytes[i] = binaryData.charCodeAt(i)
  }

  const convertedFile = new File([bytes], result.convertedFile.name, {
    type: result.convertedFile.type,
    lastModified: Date.now()
  })

  console.log('✅ Server conversion completed successfully:', {
    name: convertedFile.name,
    type: convertedFile.type,
    size: convertedFile.size
  })

  return convertedFile
}

// Handle HEIC files when conversion is not possible
function handleHeicFallback(file: File): File {
  console.log('Using HEIC file as-is, conversion will be handled server-side if needed')

  // Create a new file with JPEG extension but keep the original data
  // This allows the upload to proceed while indicating the expected output format
  const jpegFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg')

  // Return original file with a note that it needs server-side processing
  return new File([file], jpegFileName, {
    type: 'image/jpeg', // Indicate expected output type
    lastModified: file.lastModified
  })
}