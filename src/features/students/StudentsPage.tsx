import { useMemo, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'
import { format, parseISO } from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import { useStudents } from '@/features/students/useStudents'
import { useStudentHistory } from '@/features/students/useStudentHistory'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Reveal } from '@/shared/ui/Reveal'
import { StatusPill, SeverityPill } from '@/shared/ui/pills'
import { controlClass } from '@/shared/ui/styles'
import { initials } from '@/shared/lib/format'
import type { AttendanceStatus, StudentReplica } from '@/types/api'

export function StudentsPage() {
  const { data: students, isLoading, isError } = useStudents()
  const [selected, setSelected] = useState<StudentReplica | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      (students ?? []).filter((s) =>
        s.fullName.toLowerCase().includes(search.toLowerCase().trim()),
      ),
    [students, search],
  )

  if (isLoading) {
    return (
      <>
        <PageHeader title="Estudiantes" />
        <Spinner label="Cargando estudiantes…" />
      </>
    )
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Estudiantes" />
        <EmptyState
          icon="ti-alert-triangle"
          title="No se pudieron cargar los estudiantes"
          message="Revisa que el Gateway y el servicio de Attendance estén arriba."
        />
      </>
    )
  }

  return (
    <Reveal>
      <PageHeader title="Estudiantes" subtitle="Consulta el historial de asistencia e incidentes." />

      {(students ?? []).length === 0 ? (
        <EmptyState
          icon="ti-users"
          title="No hay estudiantes"
          message="La lista se llena cuando Secretaría matricula estudiantes (evento StudentEnrolled)."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div>
            <input
              placeholder="Buscar estudiante"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${controlClass} mb-3`}
            />
            <Card className="overflow-hidden">
              {filtered.map((s) => (
                <button
                  key={s.studentId}
                  onClick={() => setSelected(s)}
                  className={`flex w-full items-center gap-3 border-b border-line px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-panel ${
                    selected?.studentId === s.studentId ? 'bg-vino-soft/50' : ''
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-vino-soft text-sm font-medium text-vino">
                    {initials(s.fullName)}
                  </span>
                  <span className="flex-1 text-base text-ink">{s.fullName}</span>
                  <Badge className="bg-panel text-muted">{s.grade}</Badge>
                </button>
              ))}
            </Card>
          </div>

          {selected ? (
            <HistoryView key={selected.studentId} student={selected} />
          ) : (
            <Card className="flex min-h-[320px] items-center justify-center p-8">
              <div className="text-center">
                <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-vino-soft">
                  <i className="ti ti-calendar-search text-3xl text-vino" aria-hidden="true" />
                </span>
                <p className="text-lg font-medium text-ink">Selecciona un estudiante</p>
                <p className="mt-1 text-base text-muted">
                  Verás su historial en un calendario por día.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </Reveal>
  )
}

function HistoryView({ student }: { student: StudentReplica }) {
  const { data, isLoading } = useStudentHistory(student.studentId)
  const attendance = data?.attendance ?? []
  const incidents = data?.incidents ?? []
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date())

  const byDate = useMemo(() => {
    const m = new Map<string, AttendanceStatus>()
    attendance.forEach((a) => m.set(a.date, a.status))
    return m
  }, [attendance])

  const modifiers = useMemo(() => {
    const present: Date[] = []
    const absent: Date[] = []
    const late: Date[] = []
    attendance.forEach((a) => {
      const d = parseISO(a.date)
      if (a.status === 'Present') present.push(d)
      else if (a.status === 'Absent') absent.push(d)
      else late.push(d)
    })
    return { present, absent, late }
  }, [attendance])

  const selectedStatus = byDate.get(format(selectedDay, 'yyyy-MM-dd')) ?? null

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vino-soft text-base font-medium text-vino">
          {initials(student.fullName)}
        </span>
        <div>
          <h2 className="font-display text-2xl text-ink">{student.fullName}</h2>
          <p className="text-base text-muted">{student.grade}</p>
        </div>
      </div>

      {isLoading ? (
        <Spinner label="Cargando historial…" />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[auto_1fr]">
          <div>
            <div className="cal-lg inline-block rounded-2xl border border-line bg-white p-4 shadow-card">
              <DayPicker
                mode="single"
                required
                selected={selectedDay}
                onSelect={(d) => d && setSelectedDay(d)}
                locale={es}
                weekStartsOn={1}
                defaultMonth={selectedDay}
                modifiers={modifiers}
                modifiersClassNames={{
                  present: 'day-present',
                  absent: 'day-absent',
                  late: 'day-late',
                }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 px-1 text-sm text-muted">
              <LegendDot className="bg-present" label="Presente" />
              <LegendDot className="bg-absent" label="Ausente" />
              <LegendDot className="bg-late" label="Tarde" />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <Card className="p-5">
              <p className="text-sm font-medium text-muted">Detalle del día</p>
              <p className="mt-0.5 mb-3 text-lg capitalize text-ink">
                {format(selectedDay, "EEEE d 'de' MMMM yyyy", { locale: es })}
              </p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={format(selectedDay, 'yyyy-MM-dd')}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  {selectedStatus ? (
                    <div className="flex items-center gap-3">
                      <StatusPill status={selectedStatus} />
                      <span className="text-base text-muted">Asistencia registrada</span>
                    </div>
                  ) : (
                    <p className="text-base text-muted">Sin registro de asistencia este día.</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </Card>

            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-muted">
                  Incidentes ({incidents.length})
                </p>
              </div>
              {incidents.length === 0 ? (
                <p className="text-base text-muted">Sin incidentes reportados.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {incidents.map((i) => (
                    <li
                      key={i.incidentId}
                      className="flex items-center justify-between rounded-xl bg-panel px-4 py-3"
                    >
                      <span className="text-base text-ink">{i.type}</span>
                      <SeverityPill severity={i.severity} />
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-sm text-muted">
                El historial expone tipo y severidad por incidente; la fecha y la descripción no
                están disponibles en esta versión del backend.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-full ${className}`} aria-hidden="true" />
      {label}
    </span>
  )
}
