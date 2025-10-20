import { NextRequest, NextResponse } from 'next/server'
const convert = require('heic-convert')

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log('🔄 HEIC Conversion: Starting conversion for:', file.name, file.type, file.size)

    // Validate that it's a HEIC file
    if (!file.type.includes('heic') && !file.type.includes('heif') &&
        !file.name.toLowerCase().endsWith('.heic') && !file.name.toLowerCase().endsWith('.heif')) {
      return NextResponse.json({ error: 'File must be a HEIC/HEIF format' }, { status: 400 })
    }

    // Validate file size (50MB max for HEIC conversion)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
    }

    try {
      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const inputBuffer = Buffer.from(bytes)

      console.log('📸 HEIC Conversion: Processing with heic-convert...')

      // Convert HEIC to JPEG using heic-convert
      const convertedBuffer = await convert({
        buffer: inputBuffer, // the HEIC file buffer
        format: 'JPEG',      // output format
        quality: 0.9         // the jpeg compression quality, between 0 and 1
      })

      console.log('✅ HEIC Conversion: Successfully converted to JPEG')
      console.log(`Original size: ${file.size} bytes, Converted size: ${convertedBuffer.length} bytes`)

      // Create a new File object from the converted buffer
      const convertedFile = new File([convertedBuffer], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
        type: 'image/jpeg',
        lastModified: Date.now()
      })

      // Return the converted file as a blob URL or base64
      const base64 = convertedBuffer.toString('base64')
      const dataUrl = `data:image/jpeg;base64,${base64}`

      return NextResponse.json({
        success: true,
        convertedFile: {
          name: convertedFile.name,
          type: convertedFile.type,
          size: convertedBuffer.length,
          dataUrl: dataUrl
        },
        originalSize: file.size,
        convertedSize: convertedBuffer.length,
        compressionRatio: ((file.size - convertedBuffer.length) / file.size * 100).toFixed(1) + '%'
      })

    } catch (conversionError) {
      console.error('❌ HEIC Conversion: heic-convert processing failed:', conversionError)

      const errorMessage = conversionError instanceof Error ? conversionError.message : 'Unknown error'

      // Check for specific conversion errors
      if (errorMessage.includes('libheif') || errorMessage.includes('decoder')) {
        return NextResponse.json({
          error: 'HEIC conversion failed due to codec issues. Please convert your HEIC file to JPEG manually:\n\n• iPhone Users: Open Photos app → Select image → Share → Save as JPEG\n• Or change iPhone camera settings: Settings → Camera → Formats → Most Compatible\n• Online converter: Search "HEIC to JPEG converter" in your browser',
          serverNote: 'Server lacks HEIC/HEIF codec support',
          fallbackToClient: true
        }, { status: 422 })
      }

      // Other conversion errors
      return NextResponse.json({
        error: 'HEIC conversion failed. This HEIC file format may not be supported. Please try converting it manually:\n\n• iPhone Users: Open Photos app → Select image → Share → Save as JPEG\n• Or change iPhone camera settings: Settings → Camera → Formats → Most Compatible',
        details: errorMessage
      }, { status: 422 })
    }

  } catch (error) {
    console.error('❌ HEIC Conversion: General error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process HEIC file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}