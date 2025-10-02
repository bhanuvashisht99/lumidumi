interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export default function Logo({ className = "", width = 40, height = 40 }: LogoProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 800 800"
        className="text-charcoal"
        fill="currentColor"
      >
        {/* Flame */}
        <path
          d="M400 50 C450 100, 500 150, 500 220 C500 280, 460 320, 420 340 C430 310, 440 280, 440 250 C440 200, 420 160, 400 140 C380 160, 360 200, 360 250 C360 280, 370 310, 380 340 C340 320, 300 280, 300 220 C300 150, 350 100, 400 50 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="24"
        />

        {/* Letter L */}
        <rect x="50" y="450" width="80" height="300" fill="currentColor"/>
        <rect x="50" y="670" width="200" height="80" fill="currentColor"/>

        {/* Letter D */}
        <path
          d="M350 450 L350 750 L450 750 C550 750, 620 680, 620 600 C620 520, 550 450, 450 450 L350 450 Z M430 530 L450 530 C500 530, 540 570, 540 600 C540 630, 500 670, 450 670 L430 670 L430 530 Z"
          fill="currentColor"
        />
      </svg>
      <span className="text-xl font-bold text-charcoal">Lumidumi</span>
    </div>
  )
}