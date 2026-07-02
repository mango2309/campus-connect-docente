import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAcademicStudents } from './useAcademicStudents'
import { Spinner } from '@/shared/ui/Spinner'
import { initials } from '@/shared/lib/format'

const PAGE_SIZE = 10

const AcPill = ({ status }: { status: string }) => {
  const m: Record<string, string> = { Active: 'ac-status-active', Suspended: 'ac-status-suspended', Graduated: 'ac-status-graduated' }
  const l: Record<string, string> = { Active: 'Activo', Suspended: 'Suspendido', Graduated: 'Graduado' }
  return <span className={`ac-badge ${m[status] ?? ''}`}>{l[status] ?? status}</span>
}

const FinPill = ({ status }: { status: string }) => {
  const m: Record<string, string> = { Paid: 'ac-status-paid', Pending: 'ac-status-pending', Overdue: 'ac-status-overdue' }
  const l: Record<string, string> = { Paid: 'Pagado', Pending: 'Pendiente', Overdue: 'Vencido' }
  return <span className={`ac-badge ${m[status] ?? ''}`}>{l[status] ?? status}</span>
}

export function StudentsListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [grade, setGrade] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading, isError, refetch } = useAcademicStudents({
    page, pageSize: PAGE_SIZE,
    grade: grade || undefined,
    search: search || undefined,
  })

  const students  = data?.items ?? []
  const total     = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const doSearch = () => { setSearch(searchInput); setPage(1) }

  return (
    <div>
      {/* Header */}
      <div className="ac-animate-up mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg,#16a34a,#0d9488)', boxShadow: '0 4px 14px rgba(22,163,74,0.3)' }}>
            <i className="ti ti-users text-xl text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#052e16' }}>Estudiantes</h1>
            {!isLoading && !isError && (
              <p className="text-sm" style={{ color: '#6b7280' }}>
                {total} estudiante{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9ca3af' }} aria-hidden="true" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
              placeholder="Nombre o documento…"
              className="ac-input pl-9"
              style={{ minWidth: '200px' }}
            />
          </div>
          <div className="relative">
            <i className="ti ti-filter absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9ca3af' }} aria-hidden="true" />
            <input
              value={grade}
              onChange={(e) => { setGrade(e.target.value); setPage(1) }}
              placeholder="Grado…"
              className="ac-input pl-9"
              style={{ width: '120px' }}
            />
          </div>
          <button onClick={doSearch} className="ac-btn-primary">
            <i className="ti ti-search" aria-hidden="true" /> Buscar
          </button>
        </div>
      </div>

      {/* Cargando */}
      {isLoading && (
        <div className="ac-card ac-animate-up flex items-center justify-center py-20">
          <Spinner label="Cargando estudiantes…" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="ac-card ac-animate-up flex flex-col items-center justify-center gap-4 py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: '#fee2e2' }}>
            <i className="ti ti-alert-triangle text-2xl" style={{ color: '#dc2626' }} aria-hidden="true" />
          </div>
          <div className="text-center">
            <p className="font-semibold" style={{ color: '#052e16' }}>No se pudieron cargar los estudiantes</p>
            <p className="text-sm" style={{ color: '#6b7280' }}>Revisa que el Gateway esté arriba.</p>
          </div>
          <button onClick={() => refetch()} className="ac-btn-secondary">
            <i className="ti ti-refresh" aria-hidden="true" /> Reintentar
          </button>
        </div>
      )}

      {/* Vacío */}
      {!isLoading && !isError && students.length === 0 && (
        <div className="ac-card ac-animate-up flex flex-col items-center justify-center gap-4 py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: '#f0fdf4' }}>
            <i className="ti ti-users text-2xl" style={{ color: '#16a34a' }} aria-hidden="true" />
          </div>
          <div className="text-center">
            <p className="font-semibold" style={{ color: '#052e16' }}>No hay estudiantes para mostrar</p>
            <p className="text-sm" style={{ color: '#6b7280' }}>No se encontraron resultados con los filtros aplicados.</p>
          </div>
        </div>
      )}

      {/* Tabla */}
      {!isLoading && !isError && students.length > 0 && (
        <div className="ac-card ac-animate-up-1 overflow-hidden">
          {/* Encabezados */}
          <div className="grid items-center gap-4 border-b px-5 py-3 text-xs font-bold uppercase tracking-wider"
            style={{
              gridTemplateColumns: '1fr 90px 110px 110px',
              borderColor: 'rgba(187,247,208,0.8)',
              color: '#6b7280',
              background: 'rgba(240,253,244,0.5)',
            }}>
            <span>Estudiante</span>
            <span>Grado</span>
            <span>Académico</span>
            <span>Financiero</span>
          </div>

          {/* Filas */}
          {students.map((s) => (
            <button
              key={s.studentId}
              onClick={() => navigate(`/estudiantes/${s.studentId}`)}
              className="ac-table-row"
              style={{ gridTemplateColumns: '1fr 90px 110px 110px' }}
            >
              <div className="flex items-center gap-3">
                <span className="ac-avatar h-9 w-9 text-xs">{initials(s.fullName)}</span>
                <div className="text-left">
                  <p className="text-sm font-medium" style={{ color: '#111827' }}>{s.fullName}</p>
                  <p className="font-mono text-xs" style={{ color: '#9ca3af' }}>{s.studentId.slice(0, 8)}…</p>
                </div>
              </div>
              <span className="rounded-lg px-2.5 py-1 text-xs font-medium"
                style={{ background: '#f3f4f6', color: '#374151' }}>
                {s.grade}
              </span>
              <AcPill status={s.academicStatus} />
              <FinPill status={s.financialStatus} />
            </button>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="ac-animate-up-2 mt-5 flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="ac-btn-secondary">
            <i className="ti ti-chevron-left" aria-hidden="true" /> Anterior
          </button>
          <span className="text-sm" style={{ color: '#6b7280' }}>
            Página <strong style={{ color: '#052e16' }}>{page}</strong> de{' '}
            <strong style={{ color: '#052e16' }}>{totalPages}</strong>
          </span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="ac-btn-secondary">
            Siguiente <i className="ti ti-chevron-right" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
