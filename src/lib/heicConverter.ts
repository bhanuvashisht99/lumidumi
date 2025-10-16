// Client-side HEIC conversion utility using libheif-js
import libheif from 'libheif-js'

export class HeicConversionError extends Error {
  constructor(message: string, public isHeicFile: boolean = true) {
    super(message)
    this.name = 'HeicConversionError'
  }
}

let heifDecoder: any = null

async function initHeifDecoder() {
  if (!heifDecoder) {
    console.log('Initializing HEIF decoder...')
    heifDecoder = await libheif()
    console.log('HEIF decoder initialized successfully')
  }
  return heifDecoder
}

export async function processImageFile(file: File): Promise<File> {
  console.log('Processing image file:', {
    name: file.name,
    type: file.type,
    size: file.size
  })

  // Check if the file is HEIC/HEIF
  const fileName = file.name.toLowerCase()
  const isHeicFile = fileName.endsWith('.heic') || fileName.endsWith('.heif') ||
                    file.type === 'image/heic' || file.type === 'image/heif'

  if (!isHeicFile) {
    // If not HEIC, return original file
    console.log('File is not HEIC, returning as-is')
    return file
  }

  console.log('HEIC file detected, attempting conversion...')

  try {
    // Initialize the decoder
    const decoder = await initHeifDecoder()

    // Read the HEIC file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const heifData = new Uint8Array(arrayBuffer)

    console.log('Decoding HEIC file...')

    // Decode the HEIC file
    const image = decoder.decode(heifData)[0]

    // Convert to ImageData
    const width = image.get_width()
    const height = image.get_height()

    console.log('HEIC decoded successfully:', { width, height })

    // Get the image data as RGBA
    const imageData = new ImageData(
      new Uint8ClampedArray(image.get_image_data_rgba8()),
      width,
      height
    )

    // Create a canvas and draw the image
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    ctx.putImageData(imageData, 0, 0)

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          // Create new file with JPEG type
          const convertedFile = new File(
            [blob],
            fileName.replace(/\.(heic|heif)$/i, '.jpg'),
            {
              type: 'image/jpeg',
              lastModified: file.lastModified
            }
          )

          console.log('HEIC conversion successful:', {
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

  } catch (error) {
    console.error('Error converting HEIC file:', error)

    // Provide a helpful fallback message for iPhone users
    throw new HeicConversionError(
      'Unable to convert HEIC file automatically. For iPhone photos, try: ' +
      'Settings > Camera > Formats > Most Compatible, then retake the photo. ' +
      'Or convert using your computer\'s built-in tools.',
      true
    )
  }
}

// Legacy function for backward compatibility
export async function convertHeicToJpeg(file: File): Promise<File> {
  return processImageFile(file)
}

export function isHeicFile(file: File): boolean {
  const fileName = file.name.toLowerCase()
  const isHeic = fileName.endsWith('.heic') || fileName.endsWith('.heif') ||
         file.type === 'image/heic' || file.type === 'image/heif'

  console.log('HEIC file check:', {
    fileName,
    fileType: file.type,
    endsWithHeic: fileName.endsWith('.heic'),
    endsWithHeif: fileName.endsWith('.heif'),
    typeIsHeic: file.type === 'image/heic',
    typeIsHeif: file.type === 'image/heif',
    result: isHeic
  })

  return isHeic
}

