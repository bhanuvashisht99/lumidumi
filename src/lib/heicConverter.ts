// Client-side HEIC conversion utility using heic2any library
import heic2any from 'heic2any'

export async function convertHeicToJpeg(file: File): Promise<File> {
  // Check if the file is HEIC/HEIF
  const fileName = file.name.toLowerCase()
  const isHeicFile = fileName.endsWith('.heic') || fileName.endsWith('.heif') ||
                    file.type === 'image/heic' || file.type === 'image/heif'

  if (!isHeicFile) {
    // If not HEIC, return original file
    return file
  }

  console.log('Converting HEIC file:', fileName)

  try {
    // Convert HEIC to JPEG using heic2any
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9
    })

    // heic2any returns Blob | Blob[], but we expect single blob for single file
    const resultBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob

    // Create a new File object with JPEG type
    const convertedFileName = fileName.replace(/\.(heic|heif)$/i, '.jpg')
    const convertedFile = new File(
      [resultBlob],
      convertedFileName,
      {
        type: 'image/jpeg',
        lastModified: file.lastModified
      }
    )

    console.log('HEIC conversion successful:', {
      originalName: fileName,
      convertedName: convertedFileName,
      originalSize: file.size,
      convertedSize: convertedFile.size
    })

    return convertedFile

  } catch (error) {
    console.error('Error converting HEIC file:', error)
    throw new Error('Failed to convert HEIC file. Please try converting to JPEG manually or use a different image.')
  }
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