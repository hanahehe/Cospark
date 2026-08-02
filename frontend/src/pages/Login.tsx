import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { useAuth } from '../context/AuthContext'
import { useSlowRequestHint } from '../hooks/useSlowRequestHint'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const isSlow = useSlowRequestHint(submitting)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <span className="mono auth-eyebrow">Welcome back</span>
      <h1>Log in to CoSpark</h1>
      <p className="auth-lede">Pick up where you left off — your ideas, matches, and teams are waiting.</p>

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@startup.com"
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn auth-submit" disabled={submitting}>
          {!submitting ? 'Log in' : isSlow ? 'Waking the server…' : 'Logging in…'}
        </button>

        {isSlow && (
          <p className="auth-hint">
            The server sleeps when it&rsquo;s not being used, so the first sign-in after a
            quiet spell can take up to a minute. Hang tight.
          </p>
        )}
      </form>

      <p className="auth-signup-line">
        New to CoSpark? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  )
}
