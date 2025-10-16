// Client-side HEIC conversion utility
// This approach converts HEIC files to JPEG using canvas-based fallback

export async function convertHeicToJpeg(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // Check if the file is HEIC/HEIF
    const fileName = file.name.toLowerCase()
    const isHeicFile = fileName.endsWith('.heic') || fileName.endsWith('.heif') ||
                      file.type === 'image/heic' || file.type === 'image/heif'

    if (!isHeicFile) {
      // If not HEIC, return original file
      resolve(file)
      return
    }

    console.log('Converting HEIC file:', fileName)

    // Create a FileReader to read the HEIC file
    const reader = new FileReader()

    reader.onload = async function(e) {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        if (!arrayBuffer) {
          throw new Error('Failed to read file data')
        }

        // Create an image element to test if browser can handle HEIC
        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          throw new Error('Canvas context not available')
        }

        img.onload = function() {
          console.log('HEIC image loaded successfully in browser, converting to JPEG')

          // Set canvas dimensions to image dimensions
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight

          // Draw the image on canvas
          ctx.drawImage(img, 0, 0)

          // Convert to JPEG blob
          canvas.toBlob(function(blob) {
            if (blob) {
              // Create a new File object with JPEG type
              const convertedFile = new File(
                [blob],
                fileName.replace(/\.(heic|heif)$/i, '.jpg'),
                { type: 'image/jpeg' }
              )
              console.log('HEIC conversion successful')
              resolve(convertedFile)
            } else {
              reject(new Error('Failed to convert HEIC to JPEG'))
            }
          }, 'image/jpeg', 0.9)
        }

        img.onerror = function() {
          // If browser can't display HEIC, provide user-friendly error
          reject(new Error('HEIC format is not supported by your browser. Please convert your image to JPEG or PNG format and try again.'))
        }

        // Try to load as blob URL first
        const blob = new Blob([arrayBuffer], { type: file.type })
        const url = URL.createObjectURL(blob)
        img.src = url

        // Clean up the URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 10000)

      } catch (error) {
        console.error('Error in HEIC conversion:', error)
        reject(new Error('Failed to process HEIC file. Please convert to JPEG or PNG format.'))
      }
    }

    reader.onerror = function() {
      reject(new Error('Failed to read HEIC file'))
    }

    reader.readAsArrayBuffer(file)
  })
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