import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '@/shared/auth/useAuth'
import { Button } from '@/shared/ui/Button'
import { Field } from '@/shared/ui/Field'
import { controlClass } from '@/shared/ui/styles'
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
      {/* Panel de marca */}
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
            Portal Docente
            <br />y Bienestar
          </h2>
          <p className="mt-4 max-w-md text-lg text-white/80">
            Toma asistencia, registra incidentes y consulta el historial de tus estudiantes en un
            solo lugar.
          </p>
        </div>
        <p className="text-sm text-white/60">Universidad · gestión escolar integrada</p>
      </div>

      {/* Formulario */}
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
              <p className="text-sm text-muted">Portal Docente / Bienestar</p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-8 shadow-card">
            <h1 className="font-display text-2xl text-ink">Iniciar sesión</h1>
            <div className="mt-3 mb-6 h-[3px] w-12 rounded-full bg-oro" />

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <Field label="Usuario" error={errors.username?.message}>
                <input
                  {...register('username')}
                  className={controlClass}
                  placeholder="docente1"
                  autoComplete="username"
                />
              </Field>
              <Field label="Contraseña" error={errors.password?.message}>
                <input
                  {...register('password')}
                  type="password"
                  className={controlClass}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </Field>

              {error && (
                <p className="rounded-xl bg-absent-bg px-4 py-3 text-base text-absent-ink">{error}</p>
              )}

              <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Ingresando…' : 'Ingresar'}
              </Button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-muted">
            Usuario de prueba: docente1 / Admin1234!
          </p>
        </motion.div>
      </div>
    </div>
  )
}
