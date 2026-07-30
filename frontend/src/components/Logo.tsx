export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M24 7C29 13.5 32.5 19 32.5 25.5C32.5 33 29 39 24 39C19 39 15.5 33 15.5 25.5C15.5 19 19 13.5 24 7Z"
        fill="url(#cospark-logo-grad)"
      />
      <path
        d="M24 20C27 24 28.5 27 28.5 30.3C28.5 34 26.5 36.5 24 36.5C21.5 36.5 19.5 34 19.5 30.3C19.5 27 21 24 24 20Z"
        fill="#0E1225"
        fillOpacity="0.55"
      />
      <defs>
        <linearGradient id="cospark-logo-grad" x1="15.5" y1="4" x2="32.5" y2="39" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFB447" />
          <stop offset="1" stopColor="#FF6B4A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function Logo({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <span className={`logo-lockup ${className}`}>
      <LogoMark size={size} />
      CoSpark
    </span>
  )
}
