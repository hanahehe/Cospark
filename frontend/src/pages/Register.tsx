import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { useAuth } from '../context/AuthContext'

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  password: string
}

const EMPTY_FORM: RegisterForm = { firstName: '', lastName: '', email: '', password: '' }

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterForm>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof RegisterForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <span className="mono auth-eyebrow">Join CoSpark</span>
      <h1>Create your account</h1>
      <p className="auth-lede">Tell us who you are — you can add skills, interests, and your startup idea next.</p>

      <form onSubmit={handleSubmit}>
        <div className="auth-field-row">
          <div className="auth-field">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              placeholder="Ada"
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              placeholder="Lovelace"
              required
            />
          </div>
        </div>
        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@startup.com"
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn auth-submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-signup-line">
        Already on CoSpark? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  )
}
