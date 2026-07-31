export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Left figure - lighter purple */}
      <circle cx="58" cy="68" r="15" fill="#9B8DD8" />
      <ellipse cx="58" cy="118" rx="17" ry="30" fill="#9B8DD8" />
      <line x1="68" y1="92" x2="94" y2="53" stroke="#9B8DD8" strokeWidth="15" strokeLinecap="round" />
      <line x1="47" y1="98" x2="33" y2="128" stroke="#9B8DD8" strokeWidth="14" strokeLinecap="round" />
      <line x1="50" y1="142" x2="42" y2="170" stroke="#9B8DD8" strokeWidth="14" strokeLinecap="round" />
      <line x1="66" y1="142" x2="72" y2="170" stroke="#9B8DD8" strokeWidth="14" strokeLinecap="round" />

      {/* Right figure - darker purple */}
      <circle cx="142" cy="68" r="15" fill="#5B4D8A" />
      <ellipse cx="142" cy="118" rx="17" ry="30" fill="#5B4D8A" />
      <line x1="132" y1="92" x2="106" y2="53" stroke="#5B4D8A" strokeWidth="15" strokeLinecap="round" />
      <line x1="153" y1="98" x2="167" y2="128" stroke="#5B4D8A" strokeWidth="14" strokeLinecap="round" />
      <line x1="150" y1="142" x2="158" y2="170" stroke="#5B4D8A" strokeWidth="14" strokeLinecap="round" />
      <line x1="134" y1="142" x2="128" y2="170" stroke="#5B4D8A" strokeWidth="14" strokeLinecap="round" />

      {/* Star at top - gold */}
      <path
        d="M100 15L108 40L135 40L113 58L121 83L100 65L79 83L87 58L65 40L92 40Z"
        fill="#FFB447"
      />
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
