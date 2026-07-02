import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '@/shared/auth/useAuth'
import { ApiError } from '@/shared/api/httpClient'

const schema = z.object({
  username: z.string().min(1, 'Ingresa tu usuario.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

type FormValues = z.infer<typeof schema>

export function LoginAcademicoPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      await login(values.username, values.password)
      const from = (location.state as { from?: string } | null)?.from ?? (location.pathname === '/login' ? '/' : location.pathname)
      navigate(from, { replace: true })
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 401
          ? 'Usuario o contraseña incorrectos.'
          : 'No se pudo iniciar sesión. Revisa que el Gateway esté arriba.',
      )
    }
  }

  return (
    <div
      className="ac-portal"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(150deg, #f0fdf4 0%, #f0fdfa 55%, #f7fef9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: '420px' }}
      >
        {/* Cabecera de marca */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4rem',
              height: '4rem',
              borderRadius: '1.25rem',
              background: 'linear-gradient(135deg, #16a34a 0%, #0d9488 100%)',
              boxShadow: '0 8px 24px rgba(22,163,74,0.35)',
              marginBottom: '1rem',
            }}
          >
            <i className="ti ti-school" style={{ fontSize: '1.75rem', color: '#fff' }} aria-hidden="true" />
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#052e16',
              letterSpacing: '-0.02em',
            }}
          >
            CampusConnect 360
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
            Portal Secretaría / Académico
          </p>
        </div>

        {/* Card del formulario */}
        <div
          className="ac-card"
          style={{ padding: '2rem', background: 'rgba(255,255,255,0.92)' }}
        >
          <h2
            style={{
              margin: '0 0 0.25rem',
              fontSize: '1.2rem',
              fontWeight: 600,
              color: '#052e16',
            }}
          >
            Iniciar sesión
          </h2>
          {/* Divider verde → teal */}
          <div className="ac-divider" />

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Usuario */}
            <div>
              <label
                htmlFor="login-username"
                style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}
              >
                Usuario
              </label>
              <input
                id="login-username"
                {...register('username')}
                className="ac-input"
                placeholder="secretaria1"
                autoComplete="username"
              />
              {errors.username && (
                <p style={{ marginTop: '0.25rem', fontSize: '0.78rem', color: '#dc2626' }}>
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="login-password"
                style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}
              >
                Contraseña
              </label>
              <input
                id="login-password"
                {...register('password')}
                type="password"
                className="ac-input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && (
                <p style={{ marginTop: '0.25rem', fontSize: '0.78rem', color: '#dc2626' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error del servidor */}
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  background: '#fee2e2',
                  color: '#b91c1c',
                  fontSize: '0.875rem',
                }}
              >
                <i className="ti ti-alert-circle" style={{ fontSize: '1rem' }} aria-hidden="true" />
                {error}
              </div>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="ac-btn-primary"
              style={{ width: '100%', marginTop: '0.25rem' }}
            >
              {isSubmitting ? (
                <>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }}
                    aria-hidden="true"
                  />
                  Ingresando…
                </>
              ) : (
                <>
                  <i className="ti ti-lock-open" style={{ fontSize: '1rem' }} aria-hidden="true" />
                  Ingresar
                </>
              )}
            </button>
          </form>
        </div>

        {/* Hint credenciales */}
        <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
          Usuario de prueba:{' '}
          <code
            style={{
              padding: '0.125rem 0.4rem',
              borderRadius: '0.375rem',
              background: '#f0fdf4',
              color: '#16a34a',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
            }}
          >
            secretaria1 / Admin1234!
          </code>
        </p>
      </motion.div>

      {/* Keyframe para el spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
