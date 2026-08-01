import { resolveAssetUrl } from '../lib/api'
import './Avatar.css'

interface AvatarProps {
  avatarUrl?: string | null
  firstName?: string | null
  lastName?: string | null
  size?: number
  className?: string
}

export function Avatar({ avatarUrl, firstName, lastName, size = 40, className = '' }: AvatarProps) {
  const resolved = resolveAssetUrl(avatarUrl)
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?'
  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) }

  if (resolved) {
    return (
      <img
        src={resolved}
        alt={`${firstName ?? ''} ${lastName ?? ''}`.trim()}
        className={`avatar-img ${className}`}
        style={style}
      />
    )
  }

  return (
    <div className={`avatar-fallback ${className}`} style={style} aria-hidden="true">
      {initials}
    </div>
  )
}
