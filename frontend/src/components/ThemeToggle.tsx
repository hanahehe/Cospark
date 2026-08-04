import { useTheme, type Theme } from '../context/ThemeContext'
import './ThemeToggle.css'

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

const OPTIONS: { value: Theme; label: string; icon: () => React.ReactElement }[] = [
  { value: 'light', label: 'Bright', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
]

/**
 * Both choices stay visible rather than hiding behind a single flip-button, so it's
 * always obvious which mode you're in and what the alternative is.
 */
export function ThemeToggle({ compact = false, className = '' }: { compact?: boolean; className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <div className={`theme-toggle${compact ? ' compact' : ''} ${className}`.trim()} role="group" aria-label="Colour theme">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = theme === value
        return (
          <button
            key={value}
            type="button"
            className={`theme-toggle-option${selected ? ' selected' : ''}`}
            aria-pressed={selected}
            title={`${label} mode`}
            onClick={() => setTheme(value)}
          >
            <Icon />
            {!compact && <span>{label}</span>}
            {compact && <span className="sr-only">{label} mode</span>}
          </button>
        )
      })}
    </div>
  )
}
