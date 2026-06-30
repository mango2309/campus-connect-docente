import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { format } from 'date-fns'
import { useStudents } from '@/features/students/useStudents'
import { apiFetch, ApiError } from '@/shared/api/httpClient'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Reveal } from '@/shared/ui/Reveal'
import { DatePicker } from '@/shared/ui/DatePicker'
import { AttendanceSegmented } from '@/shared/ui/SegmentedControl'
import { controlClass } from '@/shared/ui/styles'
import { useToast } from '@/shared/ui/useToast'
import { initials } from '@/shared/lib/format'
import type { AttendanceStatus, RecordAttendanceResponse, StudentReplica } from '@/types/api'

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

export function AttendancePage() {
  const { data: students, isLoading, isError, refetch } = useStudents()
  const { notify } = useToast()
  const [date, setDate] = useState<Date>(() => new Date())
  const [search, setSearch] = useState('')
  const [grade, setGrade] = useState('')
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({})

  const grades = useMemo(
    () => [...new Set((students ?? []).map((s) => s.grade))].sort(),
    [students],
  )

  const filtered = useMemo(
    () =>
      (students ?? []).filter(
        (s) =>
          s.fullName.toLowerCase().includes(search.toLowerCase().trim()) &&
          (grade === '' || s.grade === grade),
      ),
    [students, search, grade],
  )

  const save = useMutation({
    mutationFn: async () => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const entries = Object.entries(marks)
      const results = await Promise.allSettled(
        entries.map(([studentId, status]) =>
          apiFetch<RecordAttendanceResponse>('/attendance/records', {
            method: 'POST',
            body: { studentId, date: dateStr, status },
          }),
        ),
      )
      const failed = results.filter((r) => r.status === 'rejected').length
      return { total: entries.length, failed }
    },
    onSuccess: ({ total, failed }) => {
      if (failed === 0) {
        notify('success', `Asistencia guardada: ${total} registro(s).`)
        setMarks({})
      } else {
        notify('error', `${failed} de ${total} registros fallaron. Reintenta los pendientes.`)
      }
    },
    onError: (e) =>
      notify('error', e instanceof ApiError ? e.message : 'No se pudo guardar la asistencia.'),
  })

  if (isLoading) {
    return (
      <>
        <PageHeader title="Asistencia del día" />
        <Spinner label="Cargando estudiantes…" />
      </>
    )
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Asistencia del día" />
        <EmptyState
          icon="ti-alert-triangle"
          title="No se pudieron cargar los estudiantes"
          message="Revisa que el Gateway esté arriba."
          action={<Button onClick={() => refetch()}>Reintentar</Button>}
        />
      </>
    )
  }

  const markedCount = Object.keys(marks).length

  return (
    <Reveal>
      <PageHeader
        title="Asistencia del día"
        subtitle="Marca el estado de cada estudiante y guarda."
        actions={<DatePicker value={date} onChange={setDate} />}
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          placeholder="Buscar estudiante"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${controlClass} min-w-[200px] flex-1`}
        />
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className={`${controlClass} w-auto`}
        >
          <option value="">Grado: Todos</option>
          {grades.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="ti-users"
          title="No hay estudiantes para mostrar"
          message="La lista se llena cuando Secretaría matricula estudiantes (evento StudentEnrolled). Si recién empiezas, pídeles que registren alumnos."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line bg-panel px-5 py-3 text-sm font-medium text-muted">
            <span>Estudiante</span>
            <span>Estado</span>
          </div>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.035 } } }}
          >
            {filtered.map((s) => (
              <motion.div key={s.studentId} variants={rowVariants}>
                <AttendanceRow
                  student={s}
                  value={marks[s.studentId] ?? null}
                  onChange={(v) => setMarks((m) => ({ ...m, [s.studentId]: v }))}
                />
              </motion.div>
            ))}
          </motion.div>
        </Card>
      )}

      <div className="mt-6 flex justify-end">
        <Button
          variant="primary"
          disabled={markedCount === 0 || save.isPending}
          onClick={() => save.mutate()}
        >
          <i className="ti ti-device-floppy text-lg" aria-hidden="true" />
          {save.isPending ? 'Guardando…' : `Guardar asistencia${markedCount ? ` (${markedCount})` : ''}`}
        </Button>
      </div>
    </Reveal>
  )
}

function AttendanceRow({
  student,
  value,
  onChange,
}: {
  student: StudentReplica
  value: AttendanceStatus | null
  onChange: (value: AttendanceStatus) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 transition-colors last:border-b-0 hover:bg-panel/60">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-vino-soft text-base font-medium text-vino">
          {initials(student.fullName)}
        </span>
        <div className="leading-tight">
          <p className="text-base text-ink">{student.fullName}</p>
          <Badge className="mt-0.5 bg-panel text-muted">{student.grade}</Badge>
        </div>
      </div>
      <AttendanceSegmented value={value} onChange={onChange} name={student.fullName} />
    </div>
  )
}
