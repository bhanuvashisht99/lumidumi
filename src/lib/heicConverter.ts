// Client-side HEIC handling utility
// Provides user-friendly guidance for HEIC files

export class HeicConversionError extends Error {
  constructor(message: string, public isHeicFile: boolean = true) {
    super(message)
    this.name = 'HeicConversionError'
  }
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

  console.log('HEIC file detected, providing conversion guidance')

  // For HEIC files, provide helpful guidance instead of trying to convert
  throw new HeicConversionError(
    'HEIC files need to be converted to JPEG or PNG format. ' +
    'Please use your device\'s Photos app or an online converter to convert the image first, then upload again.',
    true
  )
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

export async function processImageFile(file: File): Promise<File> {
  console.log('processImageFile called with:', {
    name: file.name,
    type: file.type,
    size: file.size
  })

  try {
    // If it's a HEIC file, try to convert it
    if (isHeicFile(file)) {
      console.log('File detected as HEIC, attempting conversion:', file.name)
      return await convertHeicToJpeg(file)
    }

    // For other image types, return as-is
    console.log('File is not HEIC, returning as-is:', file.name)
    return file
  } catch (error) {
    console.error('Error processing image file:', error)
    throw error
  }
}