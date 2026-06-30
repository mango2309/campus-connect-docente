import { clearTokens, getTokens, setTokens } from '@/shared/auth/authStorage'
import type { LoginResponse } from '@/types/api'

const BASE = '/api'

export class ApiError extends Error {
  status: number
  detail?: string

  constructor(status: number, message: string, detail?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  skipAuth?: boolean
}

// Single-flight: si varias requests reciben 401 a la vez, refrescamos una sola vez.
let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  const tokens = getTokens()
  if (!tokens?.refreshToken) return false

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE}/identity/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-Id': crypto.randomUUID(),
          },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        })
        if (!res.ok) return false
        const data = (await res.json()) as LoginResponse
        setTokens(data)
        return true
      } catch {
        return false
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, skipAuth = false } = options

  const doFetch = async (): Promise<Response> => {
    const headers: Record<string, string> = {
      // Trazabilidad: cada request lleva su correlation id; el backend lo propaga por toda la cadena.
      'X-Correlation-Id': crypto.randomUUID(),
    }
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (!skipAuth) {
      const tokens = getTokens()
      if (tokens?.accessToken) headers.Authorization = `Bearer ${tokens.accessToken}`
    }
    return fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  let res = await doFetch()

  if (res.status === 401 && !skipAuth) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      res = await doFetch()
    } else {
      clearTokens()
      throw new ApiError(401, 'Tu sesión expiró. Vuelve a iniciar sesión.')
    }
  }

  if (!res.ok) {
    let detail: string | undefined
    try {
      const problem = (await res.json()) as { detail?: string; title?: string }
      detail = problem.detail ?? problem.title
    } catch {
      detail = undefined
    }
    throw new ApiError(res.status, detail ?? `Error ${res.status}`, detail)
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}
