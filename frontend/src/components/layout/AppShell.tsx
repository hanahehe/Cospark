import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePageEntrance } from '../../hooks/usePageEntrance'
import './AppShell.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/search', label: 'Search' },
  { to: '/ideas', label: 'Startup Ideas' },
  { to: '/requests', label: 'Requests' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
]

export function AppShell() {
  const { user, logout } = useAuth()
  const contentRef = usePageEntrance<HTMLDivElement>()

  return (
    <div className="shell">
      <aside className="shell-sidebar glass-strong">
        <div className="shell-logo">
          <span className="dot" />
          CoSpark
        </div>
        <nav className="shell-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="shell-user">
          <div className="shell-user-name">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="shell-user-email mono">{user?.email}</div>
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
