import type { ReactNode } from 'react'
import './PageHeader.css'

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <header className="page-header reveal">
      <div>
        <span className="mono page-header-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </header>
  )
}
