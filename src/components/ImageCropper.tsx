'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
  convertToPixelCrop
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropperProps {
  src: string
  onCropComplete: (croppedImageBlob: Blob) => void
  onCancel: () => void
  aspectRatio?: number
  minWidth?: number
  minHeight?: number
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ImageCropper({
  src,
  onCropComplete,
  onCancel,
  aspectRatio = 1, // Default to square
  minWidth = 150,
  minHeight = 150
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, aspectRatio))
  }

  const getCroppedImg = useCallback(() => {
    const image = imgRef.current
    const canvas = canvasRef.current

    if (!image || !canvas || !completedCrop) {
      throw new Error('Crop canvas does not exist')
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const pixelRatio = window.devicePixelRatio
    canvas.width = completedCrop.width * pixelRatio * scaleX
    canvas.height = completedCrop.height * pixelRatio * scaleY

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = 'high'

    const cropX = completedCrop.x * scaleX
    const cropY = completedCrop.y * scaleY

    const centerX = image.naturalWidth / 2
    const centerY = image.naturalHeight / 2

    ctx.save()

    ctx.translate(-cropX, -cropY)
    ctx.translate(centerX, centerY)
    ctx.rotate((rotate * Math.PI) / 180)
    ctx.scale(scale, scale)
    ctx.translate(-centerX, -centerY)
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
    )

    ctx.restore()

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'))
          return
        }
        resolve(blob)
      }, 'image/jpeg', 0.85)
    })
  }, [completedCrop, scale, rotate])

  const handleCropConfirm = async () => {
    try {
      const croppedImageBlob = await getCroppedImg()
      onCropComplete(croppedImageBlob)
    } catch (error) {
      console.error('Error cropping image:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal">Crop Image</h3>
            <button
              onClick={onCancel}
              className="text-charcoal/60 hover:text-charcoal"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Crop Controls */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-charcoal">Scale:</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-charcoal/60">{scale}x</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-charcoal">Rotate:</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotate}
                  onChange={(e) => setRotate(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-charcoal/60">{rotate}°</span>
              </div>

              <button
                onClick={() => { setScale(1); setRotate(0) }}
                className="text-sm text-cream-300 hover:text-cream-300/80 font-medium"
              >
                Reset
              </button>
            </div>

            {/* Crop Area */}
            <div className="flex justify-center bg-gray-100 p-4 rounded-lg">
              <ReactCrop
                crop={crop}
                onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
                onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
                aspect={aspectRatio}
                minWidth={minWidth}
                minHeight={minHeight}
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={src}
                  style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                  onLoad={onImageLoad}
                  className="max-w-full max-h-96"
                />
              </ReactCrop>
            </div>

            {/* Preset aspect ratios */}
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-charcoal">Quick ratios:</span>
              <button
                onClick={() => {
                  const img = imgRef.current
                  if (img) {
                    setCrop(centerAspectCrop(img.width, img.height, 1))
                  }
                }}
                className="text-xs px-2 py-1 bg-cream-100 text-charcoal rounded hover:bg-cream-200"
              >
                1:1
              </button>
              <button
                onClick={() => {
                  const img = imgRef.current
                  if (img) {
                    setCrop(centerAspectCrop(img.width, img.height, 4/3))
                  }
                }}
                className="text-xs px-2 py-1 bg-cream-100 text-charcoal rounded hover:bg-cream-200"
              >
                4:3
              </button>
              <button
                onClick={() => {
                  const img = imgRef.current
                  if (img) {
                    setCrop(centerAspectCrop(img.width, img.height, 16/9))
                  }
                }}
                className="text-xs px-2 py-1 bg-cream-100 text-charcoal rounded hover:bg-cream-200"
              >
                16:9
              </button>
              <button
                onClick={() => {
                  const img = imgRef.current
                  if (img) {
                    setCrop(undefined) // Free crop
                  }
                }}
                className="text-xs px-2 py-1 bg-cream-100 text-charcoal rounded hover:bg-cream-200"
              >
                Free
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-charcoal hover:text-charcoal/80 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                disabled={!completedCrop}
                className="px-4 py-2 bg-cream-300 text-white rounded-lg hover:bg-cream-300/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for cropping */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </div>
  )
}