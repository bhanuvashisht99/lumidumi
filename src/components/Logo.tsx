import Image from 'next/image'

interface LogoProps {
  className?: string
  width?: number
  height?: number
  showText?: boolean
}

export default function Logo({ className = "", width = 40, height = 40, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Image
        src="/images/Lumidumi.png"
        alt="Lumidumi Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="text-xl font-bold text-charcoal">Lumidumi</span>
      )}
    </div>
  )
}