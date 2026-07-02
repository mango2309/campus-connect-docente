# CampusConnect 360 — Frontend (Portal Académico / Secretaría)

Este repositorio contiene únicamente el portal Académico / Secretaría. El backend vive en
otro repo y no se modifica desde aquí. La base visual y técnica ya está consolidada en este
frontend, así que reutiliza `src/shared/` en lugar de duplicar componentes.

## Qué es este repo

Frontend del Portal Académico / Secretaría. Permite matrícula, listado y ficha de
estudiantes, junto con la infraestructura compartida de auth, layout y cliente HTTP.

## Stack

React 19 · Vite · TypeScript · Tailwind CSS v4 (tokens propios) · TanStack Query · React Hook
Form + Zod · React Router 7 · react-day-picker · motion.

## Cómo correr

1. Backend arriba desde el repo del backend.
2. Frontend:
   ```bash
   npm install
   cp .env.example .env   # VITE_GATEWAY_URL: 8080 (docker) o 5287 (dotnet run)
   npm run dev            # http://localhost:5173
   ```

Scripts: `npm run dev` · `npm run build` · `npm run preview` · `npm run lint`.

## Integración con el backend (CRÍTICO)

- El frontend habla **SIEMPRE con el API Gateway**, nunca con microservicios directos.
- **El backend NO tiene CORS.** Se resuelve con el proxy del dev server en `vite.config.ts`.
- Toda request lleva `Authorization: Bearer` cuando hay sesión y `X-Correlation-Id`.
- Los IDs de estudiante son **ULID de 26 caracteres**: se eligen de una lista, nunca se tipean.
- La lista de estudiantes de Attendance es una réplica que se llena con `StudentEnrolled`.

## Arquitectura del código

```
src/
├─ app/        router + providers (QueryClient, Auth, Toast, MotionConfig)
├─ shared/     base reutilizable del portal
│  ├─ ui/      Button, Field, Card, Badge, Spinner, EmptyState, PageHeader,
│  │           SegmentedControl, DatePicker, Reveal, pills, toast/useToast
│  ├─ layout/  AppShell, TopBar, NavTabs
│  ├─ api/     httpClient, useHealth
│  ├─ auth/    AuthContext, useAuth, RoleGuard, authStorage
│  ├─ lib/     utilidades (initials, today)
│  └─ styles/  tokens.css
├─ features/   módulos del portal Académico / Secretaría
└─ types/      contratos del backend (DTOs)
```

Alias de import: `@/` → `src/`.

## Identidad visual

- Paleta: `vino`, `vino-dark`, `oro`, `ink`, `muted`, `line`, `panel`.
- Tipografías: `font-display` para títulos/marca y `font-sans` para lo operativo.
- Elemento firma: la regla dorada bajo cada título con `PageHeader`.
- Movimiento: usalo con criterio; `MotionConfig reducedMotion="user"` ya respeta accesibilidad.
- Idioma: UI en español, sentence case y copy claro.

## Cómo agregar una pantalla nueva

1. Crea `src/features/<tu-area>/` con páginas y hooks.
2. Usa TanStack Query sobre `apiFetch`.
3. Formularios con React Hook Form + Zod.
4. Reutiliza `PageHeader`, `Card`, `Button`, `EmptyState`, `Spinner`, etc.
5. Registra rutas en `src/app/router.tsx` dentro de un `RoleGuard`.

## Endpoints que consume este portal (vía Gateway)

| Acción | Método y ruta | Rol |
|---|---|---|
| Login | `POST /api/identity/auth/login` | público |
| Refresh | `POST /api/identity/auth/refresh` | público |
| Listar estudiantes | `GET /api/attendance/students` | Secretaria |
| Registrar asistencia | `POST /api/attendance/records` `{studentId,date,status}` | Secretaria |
| Reportar incidente | `POST /api/attendance/incidents` `{studentId,type,severity,description}` | Secretaria |
| Historial | `GET /api/attendance/students/{id}/history` | Secretaria |
| Health | `GET /api/attendance/health` | público |

- `status`: `Present` / `Absent` / `Late`. `severity`: `Low` / `Medium` / `High`.
- `type` de incidente es texto libre.
- El historial devuelve por incidente solo `{ incidentId, type, severity }`.

## Gotchas de TypeScript

- `verbatimModuleSyntax: true` → importá tipos con `import type { … }`.
- `erasableSyntaxOnly: true` → no uses `enum`; usa uniones de string.
- `noUnusedLocals/Parameters` → no dejes imports ni variables sin usar.

## Convenciones de git

- Conventional commits, sin atribución de IA / Co-Authored-By.
- Rama de trabajo: `main`.
