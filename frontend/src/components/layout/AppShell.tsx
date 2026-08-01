import { useLayoutEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import gsap from 'gsap'
import { useAuth } from '../../context/AuthContext'
import { Logo } from '../Logo'
import { Avatar } from '../Avatar'
import { profileApi } from '../../lib/endpoints'
import './AppShell.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/search', label: 'Search' },
  { to: '/ideas', label: 'Startup Ideas' },
  { to: '/requests', label: 'Requests' },
  { to: '/chat', label: 'Messages' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
]

export function AppShell() {
  const { user, logout } = useAuth()
  const contentRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()
  const profileQuery = useQuery({ queryKey: ['profile', 'me'], queryFn: profileApi.me })

  useLayoutEffect(() => {
    if (!contentRef.current) return
    gsap.killTweensOf(contentRef.current)
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
    )
  }, [location.pathname])

  return (
    <div className="shell">
      <aside className="shell-sidebar glass-strong">
        <Logo size={20} className="shell-logo" />
        <nav className="shell-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="shell-user">
          <div className="shell-user-identity">
            <Avatar avatarUrl={profileQuery.data?.avatarUrl} firstName={user?.firstName} lastName={user?.lastName} size={36} />
            <div>
              <div className="shell-user-name">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="shell-user-email mono">{user?.email}</div>
            </div>
          </div>
          <button type="button" className="btn btn-ghost shell-logout" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="shell-main bg-glow">
        <div className="shell-content" ref={contentRef}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
