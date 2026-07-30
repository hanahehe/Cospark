export function timeAgo(iso: string): string {
  const diffMs = Date.parse(iso) - Date.now()
  const diffSec = Math.round(diffMs / 1000)
  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ]
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [unit, secondsInUnit] of divisions) {
    if (Math.abs(diffSec) >= secondsInUnit || unit === 'second') {
      return rtf.format(Math.round(diffSec / secondsInUnit), unit)
    }
  }
  return ''
}
