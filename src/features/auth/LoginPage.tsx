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

export function LoginPage() {
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
      const from = (location.state as { from?: string } | null)?.from ?? '/'
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
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,#7a1b2e_0%,#5e1422_55%,#4e0f1c_100%)] p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/12">
            <i className="ti ti-school text-2xl text-oro-soft" aria-hidden="true" />
          </span>
          <span className="font-display text-xl">CampusConnect 360</span>
        </div>
        <div>
          <div className="mb-4 h-1 w-16 rounded-full bg-oro" />
          <h2 className="font-display text-4xl leading-tight">
            Portal Académico
            <br />y Secretaría
          </h2>
          <p className="mt-4 max-w-md text-lg text-white/80">
            Gestiona matrícula, consulta estudiantes y trabaja con el historial académico desde
            una sola interfaz.
          </p>
        </div>
        <p className="text-sm text-white/60">Universidad · gestión escolar integrada</p>
      </div>

      <div className="flex items-center justify-center bg-panel px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-vino">
              <i className="ti ti-school text-2xl text-oro-soft" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-lg text-ink">CampusConnect 360</p>
              <p className="text-sm text-muted">Portal Académico / Secretaría</p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-8 shadow-card">
            <h1 className="font-display text-2xl text-ink">Iniciar sesión</h1>
            <div className="mt-3 mb-6 h-[3px] w-12 rounded-full bg-oro" />

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div>
                <label
                  htmlFor="login-username"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Usuario
                </label>
                <input
                  id="login-username"
                  {...register('username')}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-vino"
                  placeholder="secretaria1"
                  autoComplete="username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Contraseña
                </label>
                <input
                  id="login-password"
                  {...register('password')}
                  type="password"
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-vino"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <p className="rounded-xl bg-absent-bg px-4 py-3 text-base text-absent-ink">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-vino px-4 py-3 text-base font-semibold text-white transition hover:bg-vino-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-muted">
            Usuario de prueba: secretaria1 / Admin1234!
          </p>
        </motion.div>
      </div>
    </div>
  )
}
