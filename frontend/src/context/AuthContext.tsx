import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi } from '../lib/endpoints'
import { registerUnauthorizedHandler, tokenStore } from '../lib/api'
import type { LoginRequest, RegisterRequest, UserSummary } from '../lib/types'

interface AuthContextValue {
  user: UserSummary | null
  isLoading: boolean
  login: (body: LoginRequest) => Promise<void>
  register: (body: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    registerUnauthorizedHandler(() => setUser(null))
  }, [])

  useEffect(() => {
    const token = tokenStore.getAccessToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => {
        // A failed check here doesn't necessarily mean the token is invalid —
        // it could be a network blip. An actual 401 already clears the token
        // via the response interceptor in api.ts; don't do it again here.
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function login(body: LoginRequest) {
    const res = await authApi.login(body)
    tokenStore.setTokens(res.accessToken, res.refreshToken)
    setUser(res.user)
  }

  async function register(body: RegisterRequest) {
    const res = await authApi.register(body)
    tokenStore.setTokens(res.accessToken, res.refreshToken)
    setUser(res.user)
  }

  function logout() {
    authApi.logout().catch(() => {})
    tokenStore.clear()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
