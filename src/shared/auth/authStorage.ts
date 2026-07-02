import type { LoginResponse, UserRole } from '@/types/api'

const KEY = 'cc-academico-auth'

export interface StoredAuth {
  accessToken: string
  refreshToken: string
  expiresAt: string
  role: UserRole
  fullName: string
}

export function getTokens(): StoredAuth | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export function setTokens(data: LoginResponse): void {
  const stored: StoredAuth = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt,
    role: data.role,
    fullName: data.fullName,
  }
  localStorage.setItem(KEY, JSON.stringify(stored))
}

export function clearTokens(): void {
  localStorage.removeItem(KEY)
}
