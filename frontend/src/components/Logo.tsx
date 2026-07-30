export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M24 4C21.2 6.7 19.4 9.1 19.4 11.3C19.4 13.5 20.9 15 23 15C24.6 15 25.8 14 26.3 12.5C29 16.2 32.5 20.9 32.5 26.5C32.5 33.9 28.9 39 24 39C19.1 39 15.5 33.9 15.5 26.5C15.5 18.9 21 10.4 24 4Z"
        fill="url(#cospark-logo-grad)"
      />
      <path
        d="M24 22.5C22.1 25.3 20.7 27.9 20.7 30.2C20.7 32.9 22.1 34.8 24 34.8C25.9 34.8 27.3 32.9 27.3 30.2C27.3 27.9 25.9 25.3 24 22.5Z"
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
