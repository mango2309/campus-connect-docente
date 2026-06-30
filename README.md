# CampusConnect 360 — Portal Docente / Bienestar

Frontend del **Portal Docente / Bienestar** de CampusConnect 360. Permite a un docente
tomar asistencia diaria, reportar incidentes/novedades de bienestar y consultar el
historial de cada estudiante. Consume el backend de microservicios (.NET) a través del
**API Gateway**.

> Repositorio independiente del backend. Este portal además establece la **base de diseño
> reutilizable** (tokens, componentes, layout, cliente HTTP, auth) que heredan los otros
> dos portales (Académico/Secretaría y Financiero/Pagos).

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4 con tokens propios (identidad UDLA: vino + oro)
- TanStack Query (estado de servidor) · React Hook Form + Zod (formularios)
- React Router 7

## Requisitos previos

1. Backend de CampusConnect 360 corriendo (microservicios + Gateway).
2. Infra en Docker: Postgres y RabbitMQ arriba.
3. Node 20+.

El backend es **.NET** (no Spring Boot). El Gateway debe estar accesible:
`http://localhost:8080` con docker compose (modo demo, default) u `http://localhost:5287`
con `dotnet run` local.

## Levantar el backend (modo demo, docker compose)

Desde el repo del backend (`campus-connect`):

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml --profile services up -d --build
```

Esto levanta Postgres + RabbitMQ + los 6 microservicios + Gateway (8080). Para el Portal
Docente alcanza con que estén arriba **identity**, **academic** (para matricular y poblar la
réplica), **attendance** y **gateway**, pero el compose los trae a todos.

## Cómo ejecutar el frontend

```bash
npm install
cp .env.example .env   # default 8080 (docker); pon 5287 si corres el backend con dotnet run
npm run dev
```

Abre http://localhost:5173.

### Usuario de prueba

| Usuario   | Contraseña  | Rol     |
| --------- | ----------- | ------- |
| docente1  | Admin1234!  | Docente |

> El portal exige rol **Docente**. Otros roles ven una pantalla de "sin acceso".

### Importante: lista de estudiantes

La lista de estudiantes es una **réplica local** que el servicio de Attendance llena al
consumir el evento `StudentEnrolled` que publica el servicio Académico. Si la lista está
vacía, es porque todavía **no se matriculó ningún estudiante** desde Secretaría/Academic.

## CORS / proxy

El backend no expone CORS. El dev server de Vite hace **proxy** de `/api` hacia el Gateway
(ver `vite.config.ts`), así el navegador siempre ve el mismo origen. No se modifica el backend.

## Estructura

```
src/
├─ app/         router + providers (QueryClient, Auth, Toast)
├─ shared/      BASE REUTILIZABLE por los 3 portales
│  ├─ ui/       Button, Field, Card, Badge, Spinner, EmptyState, PageHeader,
│  │            SegmentedControl, pills, toast
│  ├─ layout/   AppShell, TopBar (barra vino), NavTabs (regla dorada)
│  ├─ api/      httpClient (Bearer + X-Correlation-Id + refresh) · useHealth
│  ├─ auth/     AuthContext, useAuth, RoleGuard, authStorage
│  ├─ lib/      utilidades (initials, today)
│  └─ styles/   tokens.css (variables UDLA)
├─ features/    ESPECÍFICO del Portal Docente
│  ├─ auth/         LoginPage
│  ├─ attendance/   AttendancePage (asistencia del día)
│  ├─ incidents/    IncidentsPage (reportar incidente)
│  └─ students/     StudentsPage (lista + historial)
└─ types/       contratos del backend (DTOs)
```

## Endpoints que consume (vía Gateway)

| Acción               | Método y ruta                                | Rol     |
| -------------------- | -------------------------------------------- | ------- |
| Login                | `POST /api/identity/auth/login`              | público |
| Refresh token        | `POST /api/identity/auth/refresh`            | público |
| Listar estudiantes   | `GET /api/attendance/students`               | Docente |
| Registrar asistencia | `POST /api/attendance/records`               | Docente |
| Reportar incidente   | `POST /api/attendance/incidents`             | Docente |
| Historial estudiante | `GET /api/attendance/students/{id}/history`  | Docente |
| Health               | `GET /api/attendance/health`                 | público |

Registrar asistencia publica el evento `AttendanceRecorded`; reportar incidente publica
`IncidentReported`. El frontend solo dispara las acciones — la mensajería la maneja el backend.

## Cómo reutilizar la base (para los otros portales)

Todo lo de `src/shared/` es agnóstico al portal: copiá/importá esos módulos, mantené los
tokens de `tokens.css`, usa `PageHeader` (regla dorada), `AppShell` y el `httpClient`.
Cada portal solo agrega su carpeta en `src/features/` y sus rutas en `src/app/router.tsx`
con el rol correspondiente en `RoleGuard`.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — compila para producción
- `npm run preview` — sirve el build
- `npm run lint` — oxlint
