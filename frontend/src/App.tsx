import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { ComingSoon } from './components/ComingSoon'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<ComingSoon title="Search" />} />
          <Route path="/ideas" element={<ComingSoon title="Startup Ideas" />} />
          <Route path="/requests" element={<ComingSoon title="Collaboration Requests" />} />
          <Route path="/notifications" element={<ComingSoon title="Notifications" />} />
          <Route path="/profile" element={<ComingSoon title="Profile" />} />
          <Route path="/settings" element={<ComingSoon title="Settings" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
