'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageWithFallbackProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallback?: string
  priority?: boolean
}

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className = '',
  fallback = '/images/placeholder-candle.svg',
  priority = false
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (imgSrc !== fallback) {
      setImgSrc(fallback)
      setHasError(true)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // If no width/height provided, use responsive image
  if (!width || !height) {
    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-cream-100 animate-pulse flex items-center justify-center">
            <div className="text-4xl">🕯️</div>
          </div>
        )}
        <img
          src={imgSrc}
          alt={alt}
          className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleError}
          onLoad={handleLoad}
          loading={priority ? 'eager' : 'lazy'}
        />
        {hasError && (
          <div className="absolute bottom-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
            No image
          </div>
        )}
      </div>
    )
  }

  // Use Next.js Image component for fixed dimensions
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-cream-100 animate-pulse flex items-center justify-center z-10">
          <div className="text-4xl">🕯️</div>
        </div>
      )}
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
      />
      {hasError && (
        <div className="absolute bottom-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
          No image
        </div>
      )}
    </div>
  )
}