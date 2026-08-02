import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiErrorBody } from './types'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * Opt a non-GET request into the cold-start retry. Only set this where running the
     * request twice is harmless (e.g. login), never where it could duplicate a record.
     */
    retryOnColdStart?: boolean
    /** Internal: how many times this request has already been retried. */
    coldStartRetries?: number
  }
}

const ACCESS_TOKEN_KEY = 'cospark.accessToken'
const REFRESH_TOKEN_KEY = 'cospark.refreshToken'

/**
 * The backend runs on a free tier that sleeps after ~15 minutes of inactivity and takes
 * up to a minute to wake. That's longer than some mobile browsers will wait on their own,
 * which surfaced to users as a bare "timeout exceeded" on the login screen.
 */
const COLD_START_TIMEOUT_MS = 90_000
const COLD_START_RETRY_DELAY_MS = 2_000
const MAX_COLD_START_RETRIES = 1
/** Statuses a sleeping/waking instance returns before the app is actually up. */
const WAKING_STATUSES = [502, 503, 504]

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
  timeout: COLD_START_TIMEOUT_MS,
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

/**
 * The STOMP endpoint. SockJS needs an absolute http(s) URL — not a ws:// one and not a
 * relative path — so in local dev (where apiOrigin is empty and Vite proxies /ws) we fall
 * back to the page's own origin.
 */
export function resolveWsUrl(): string {
  const origin = apiOrigin || window.location.origin
  return `${origin}/ws`
}

/**
 * Nudges a sleeping backend awake the moment the app loads, so it is already starting up
 * while the user reads the page and types. Fire-and-forget: `no-cors` means we can't read
 * the response, but the request still reaches the server, which is all that's needed.
 * Skipped in local dev, where the backend is on this machine and never sleeps.
 */
export function warmUpBackend(): void {
  if (!apiOrigin) return
  void fetch(`${apiOrigin}/actuator/health`, { mode: 'no-cors', cache: 'no-store' }).catch(() => {
    // Unreachable right now is exactly the case we're trying to fix; nothing to do here.
  })
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

/** No response at all, or a status the platform returns while the instance boots. */
function looksLikeColdStart(error: AxiosError): boolean {
  if (!error.response) return true
  return WAKING_STATUSES.includes(error.response.status)
}

/**
 * GETs are safe to repeat. Anything else has to opt in, because a request that timed out
 * might still have been processed server-side.
 */
function mayRetry(config: InternalAxiosRequestConfig): boolean {
  if (config.retryOnColdStart) return true
  return (config.method ?? 'get').toLowerCase() === 'get'
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      tokenStore.clear()
      onUnauthorized?.()
    }

    const config = error.config
    if (config && looksLikeColdStart(error) && mayRetry(config)) {
      const attempts = config.coldStartRetries ?? 0
      if (attempts < MAX_COLD_START_RETRIES) {
        config.coldStartRetries = attempts + 1
        await new Promise((resolve) => setTimeout(resolve, COLD_START_RETRY_DELAY_MS))
        return api(config)
      }
    }

    return Promise.reject(new Error(describe(error)))
  },
)

/** Turns transport-level failures into something a person can act on. */
function describe(error: AxiosError<ApiErrorBody>): string {
  const serverMessage = error.response?.data?.message
  if (serverMessage) return serverMessage

  if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message ?? '')) {
    return 'The server took too long to respond. It may have been asleep — please try again in a moment.'
  }
  if (!error.response) {
    return "Couldn't reach the server. Check your connection and try again."
  }
  if (WAKING_STATUSES.includes(error.response.status)) {
    return 'The server is starting up. Please try again in a moment.'
  }
  return error.message ?? 'Something went wrong'
}
