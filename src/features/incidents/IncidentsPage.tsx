import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useStudents } from '@/features/students/useStudents'
import { apiFetch, ApiError } from '@/shared/api/httpClient'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Field } from '@/shared/ui/Field'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Reveal } from '@/shared/ui/Reveal'
import { controlClass, textareaClass } from '@/shared/ui/styles'
import { useToast } from '@/shared/ui/useToast'
import type { ReportIncidentResponse } from '@/types/api'

// El backend acepta `type` como TEXTO LIBRE (no hay catálogo). Curamos categorías en
// español para consistencia; "Otro" permite especificar uno propio.
const TYPE_OPTIONS = ['Conducta', 'Salud', 'Seguridad', 'Convivencia', 'Rendimiento académico', 'Otro']

const schema = z
  .object({
    studentId: z.string().length(26, 'Selecciona un estudiante de la lista.'),
    type: z.string().min(1, 'Selecciona el tipo de incidente.'),
    customType: z.string().optional(),
    severity: z
      .string()
      .refine((v) => ['Low', 'Medium', 'High'].includes(v), 'Selecciona la severidad.'),
    description: z.string().min(1, 'Describe el incidente.'),
  })
  .refine((d) => d.type !== 'Otro' || (d.customType?.trim().length ?? 0) > 0, {
    message: 'Especifica el tipo.',
    path: ['customType'],
  })

type FormValues = z.infer<typeof schema>

export function IncidentsPage() {
  const { data: students, isLoading, isError } = useStudents()
  const { notify } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { studentId: '', type: '', customType: '', severity: '', description: '' },
  })

  const typeValue = watch('type')

  const submit = useMutation({
    mutationFn: (values: FormValues) => {
      const type = values.type === 'Otro' ? values.customType!.trim() : values.type
      return apiFetch<ReportIncidentResponse>('/attendance/incidents', {
        method: 'POST',
        body: {
          studentId: values.studentId,
          type,
          severity: values.severity,
          description: values.description,
        },
      })
    },
    onSuccess: (res) => {
      notify('success', `Incidente registrado (severidad ${res.severity}).`)
      reset()
    },
    onError: (e) =>
      notify('error', e instanceof ApiError ? e.message : 'No se pudo registrar el incidente.'),
  })

  if (isLoading) {
    return (
      <>
        <PageHeader title="Reportar incidente / novedad" />
        <Spinner label="Cargando estudiantes…" />
      </>
    )
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Reportar incidente / novedad" />
        <EmptyState
          icon="ti-alert-triangle"
          title="No se pudieron cargar los estudiantes"
          message="Revisa que el Gateway esté arriba."
        />
      </>
    )
  }

  return (
    <Reveal>
      <PageHeader
        title="Reportar incidente / novedad"
        subtitle="Registra una novedad de conducta o bienestar de un estudiante."
      />
      {!students || students.length === 0 ? (
        <EmptyState
          icon="ti-users"
          title="No hay estudiantes"
          message="Necesitas estudiantes matriculados (evento StudentEnrolled) para reportar un incidente."
        />
      ) : (
        <Card className="max-w-2xl p-7">
          <form
            onSubmit={handleSubmit((values) => submit.mutate(values))}
            className="flex flex-col gap-5"
          >
            <Field label="Estudiante" error={errors.studentId?.message}>
              <select {...register('studentId')} className={controlClass}>
                <option value="">Selecciona un estudiante</option>
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.fullName} — {s.grade}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Tipo" error={errors.type?.message}>
                <select {...register('type')} className={controlClass}>
                  <option value="">Selecciona un tipo</option>
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Severidad" error={errors.severity?.message}>
                <select {...register('severity')} className={controlClass}>
                  <option value="">Selecciona la severidad</option>
                  <option value="Low">Baja</option>
                  <option value="Medium">Media</option>
                  <option value="High">Alta</option>
                </select>
              </Field>
            </div>

            {typeValue === 'Otro' && (
              <Field label="Especifica el tipo" error={errors.customType?.message}>
                <input
                  {...register('customType')}
                  className={controlClass}
                  placeholder="Ej. Acoso escolar"
                />
              </Field>
            )}

            <Field label="Descripción" error={errors.description?.message}>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Detalle del incidente"
                className={textareaClass}
              />
            </Field>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={submit.isPending}>
                <i className="ti ti-flag text-lg" aria-hidden="true" />
                {submit.isPending ? 'Registrando…' : 'Reportar incidente'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </Reveal>
  )
}
