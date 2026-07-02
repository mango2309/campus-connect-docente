import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/auth/useAuth'
import { useHealth } from '@/shared/api/useHealth'
import { initials } from '@/shared/lib/format'

export function TopBar() {
  const { user, logout } = useAuth()
  const online = useHealth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header
      style={{
        background: 'linear-gradient(110deg, #064e3b 0%, #065f46 45%, #0d9488 100%)',
        borderBottom: '1px solid rgba(110,231,183,0.2)',
      }}
      className="text-white"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3.5">
        {/* Logo + título */}
        <div className="flex items-center gap-3.5">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)' }}
          >
            <i className="ti ti-school text-xl" style={{ color: '#6ee7b7' }} aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-base font-semibold tracking-tight">CampusConnect 360</p>
            <p className="text-xs" style={{ color: 'rgba(110,231,183,0.9)' }}>
              Portal Secretaría / Académico
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          {/* Estado de conexión */}
          <span
            className="hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium sm:flex"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <span
              className={`h-2 w-2 rounded-full ${online ? 'ac-pulse' : ''}`}
              style={{ background: online ? '#86efac' : 'rgba(255,255,255,0.3)' }}
              aria-hidden="true"
            />
            {online ? 'En línea' : 'Sin conexión'}
          </span>

          {/* Usuario */}
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.18)', color: '#d1fae5' }}
            >
              {user ? initials(user.fullName) : '?'}
            </span>
            <span className="hidden text-sm font-medium sm:inline" style={{ color: '#d1fae5' }}>
              {user?.fullName}
            </span>
          </div>

          {/* Salir */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200"
            style={{ color: 'rgba(209,250,229,0.85)' }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }}
          >
            <i className="ti ti-logout text-base" aria-hidden="true" />
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
