import axios, { type AxiosError } from 'axios'
import type { ApiErrorBody } from './types'

const ACCESS_TOKEN_KEY = 'cospark.accessToken'
const REFRESH_TOKEN_KEY = 'cospark.refreshToken'

export const tokenStore = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

const resolvedBaseURL = import.meta.env.VITE_API_URL ?? '/api'

export const api = axios.create({
  baseURL: resolvedBaseURL,
  headers: {
    'Content-Type': 'application/json',
    // Skips ngrok's free-tier browser-warning interstitial page, which would
    // otherwise return an HTML page instead of the actual JSON response.
    'ngrok-skip-browser-warning': 'true',
  },
})

// Origin (no /api suffix) used to resolve server-relative asset paths like
// avatarUrl, so they keep working across tunnel URL changes — only a
// redeploy is needed, not touching stored data.
const apiOrigin = resolvedBaseURL.replace(/\/api\/?$/, '')

export function resolveAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  return `${apiOrigin}${path}`
}

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * There is no refresh-token endpoint on the backend yet (AuthController only
 * exposes register/login/logout/verify/me) — a 401 means the access token is
 * dead, so the only correct move today is to drop the session. Swap this for
 * a real refresh call once /api/auth/refresh exists.
 */
let onUnauthorized: (() => void) | null = null
export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      tokenStore.clear()
      onUnauthorized?.()
    }
    const message = error.response?.data?.message ?? error.message ?? 'Something went wrong'
    return Promise.reject(new Error(message))
  },
)
