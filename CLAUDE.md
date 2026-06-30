# CampusConnect 360 — Frontend (Portal Docente / Bienestar)

Contexto para quien clone este repo y construya **los otros portales** (Académico/Secretaría,
Financiero/Pagos) sobre esta base. Lee esto antes de escribir código.

## Qué es este repo

Frontend del **Portal Docente / Bienestar**. Es un repositorio **separado del backend**
(el backend es .NET y vive en otro repo). Este portal además fija la **identidad visual y la
base reutilizable** que los demás portales deben respetar (mismos colores, tipografías y
componentes). No reinventes el estilo: reutiliza `src/shared/`.

Hay 3 portales en total, uno por rol:
| Portal | Rol JWT | Usuario de prueba |
|---|---|---|
| Docente / Bienestar (este) | `Docente` | docente1 / Admin1234! |
| Académico / Secretaría | `Secretaria` | secretaria1 / Admin1234! |
| Financiero / Pagos | `Finanzas` | finanzas1 / Admin1234! |
| (Dashboard Directivo) | `Direccion` | director1 / Admin1234! |

## Stack

React 19 · Vite · TypeScript · Tailwind CSS v4 (tokens propios) · TanStack Query (estado de
servidor) · React Hook Form + Zod (formularios) · React Router 7 · react-day-picker (calendarios)
· motion (animaciones).

## Cómo correr

1. Backend arriba (docker compose, desde el repo backend). Mínimo para ESTE portal:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.local.yml --profile services up -d --build --no-deps identity-service academic-service attendance-service gateway
   ```
   (Cada portal necesita su propio servicio: Académico→academic, Financiero→payments, etc. + identity + gateway.)
2. Frontend:
   ```bash
   npm install
   cp .env.example .env   # VITE_GATEWAY_URL: 8080 (docker) o 5287 (dotnet run)
   npm run dev            # http://localhost:5173
   ```

Scripts: `npm run dev` · `npm run build` · `npm run preview` · `npm run lint` (oxlint).

## Integración con el backend (CRÍTICO)

- El frontend habla **SIEMPRE con el API Gateway**, nunca con los microservicios directo.
- **El backend NO tiene CORS.** Se resuelve con el **proxy del dev server** (`vite.config.ts`
  reenvía `/api` → Gateway). No se modifica el backend.
- Toda request lleva `Authorization: Bearer` (si hay sesión) y `X-Correlation-Id` (trazabilidad).
  Ante 401, el cliente intenta refresh una vez (ver `src/shared/api/httpClient.ts`).
- Los IDs de estudiante son **ULID de 26 caracteres**: se **eligen de una lista**, nunca se tipean.
- La lista de estudiantes de Attendance es una **réplica** que se llena con el evento
  `StudentEnrolled` (lo publica Academic al matricular). Arranca vacía.

## Arquitectura del código

```
src/
├─ app/        router + providers (QueryClient, Auth, Toast, MotionConfig)
├─ shared/     ◄── BASE REUTILIZABLE — no la dupliques, impórtala
│  ├─ ui/      Button, Field, Card, Badge, Spinner, EmptyState, PageHeader,
│  │           SegmentedControl, DatePicker, Reveal, pills, toast/useToast
│  ├─ layout/  AppShell, TopBar (barra vino), NavTabs (regla dorada)
│  ├─ api/     httpClient (Bearer + X-Correlation-Id + refresh) · useHealth
│  ├─ auth/    AuthContext, useAuth, RoleGuard, authStorage
│  ├─ lib/     utilidades (initials, today)
│  └─ styles/  tokens.css (variables UDLA + theming de react-day-picker)
├─ features/   ◄── ESPECÍFICO de cada portal (vos agregás tu carpeta acá)
│  ├─ auth/ · attendance/ · incidents/ · students/
└─ types/      contratos del backend (DTOs)
```

Alias de import: `@/` → `src/` (ej. `import { Button } from '@/shared/ui/Button'`).

## Identidad visual (NO la cambies, respetala)

- **Paleta** (en `tokens.css` como tokens de Tailwind): `vino` `#7A1B2E` (primario),
  `vino-dark`, `oro` `#B0892F` (acento), `ink`, `muted`, `line`, `panel`, y estados
  `present`/`absent`/`late` con sus `-bg`/`-ink`. Usa `bg-vino`, `text-oro`, etc.
- **Tipografías**: `font-display` (Spectral, serif) para títulos/marca; `font-sans` (Inter)
  para todo lo operativo. Cargadas en `index.html`.
- **Elemento firma**: la **regla dorada** bajo cada título → usa `<PageHeader title subtitle />`.
- **Escala**: base 18px (en `tokens.css`). Tamaños en `rem` para que todo escale parejo.
- **Sombras**: `shadow-card` (tarjetas) y `shadow-pop` (popovers).
- **Movimiento**: usalo con criterio (entrada de secciones con `<Reveal>`, hover, toasts).
  `MotionConfig reducedMotion="user"` ya respeta accesibilidad. No abuses de animaciones.
- **Idioma**: UI en español, sentence case, copy claro y orientado a la acción.

## Cómo agregar un portal/pantalla nueva

1. Crea `src/features/<tu-portal>/` con tus páginas y hooks.
2. Datos de servidor con TanStack Query (`useQuery`/`useMutation`) sobre `apiFetch` del
   `httpClient`. Definí los DTOs en `src/types/api.ts`.
3. Formularios con React Hook Form + Zod (`Field` + `controlClass`/`textareaClass`).
4. Reutiliza `PageHeader`, `Card`, `Button`, `EmptyState`, `Spinner`, etc. de `shared/ui`.
5. Registra las rutas en `src/app/router.tsx` dentro de un `<RoleGuard allow={['<TuRol>']}>`.
6. Maneja los 3 estados siempre: loading (`Spinner`), error y vacío (`EmptyState`).

## Endpoints que consume este portal (vía Gateway)

| Acción | Método y ruta | Rol |
|---|---|---|
| Login | `POST /api/identity/auth/login` | público |
| Refresh | `POST /api/identity/auth/refresh` | público |
| Listar estudiantes | `GET /api/attendance/students` | Docente |
| Registrar asistencia | `POST /api/attendance/records` `{studentId,date,status}` | Docente |
| Reportar incidente | `POST /api/attendance/incidents` `{studentId,type,severity,description}` | Docente |
| Historial | `GET /api/attendance/students/{id}/history` | Docente |
| Health | `GET /api/attendance/health` | público |

- `status`: `Present` / `Absent` / `Late`. `severity`: `Low` / `Medium` / `High`.
- `type` de incidente es **texto libre** (no hay catálogo en el backend). En el form se ofrecen
  categorías en español + "Otro".
- **Limitación del backend**: el historial devuelve por incidente solo `{ incidentId, type,
  severity }` — sin fecha ni descripción. Por eso el calendario del historial marca solo
  asistencia (que sí tiene fecha) y los incidentes van en panel aparte.

## Gotchas de TypeScript (config del scaffold)

- `verbatimModuleSyntax: true` → importá tipos con `import type { … }`.
- `erasableSyntaxOnly: true` → **no uses `enum`**; usa uniones de string (`'A' | 'B'`).
- `noUnusedLocals/Parameters` → no dejes imports ni variables sin usar.

## Convenciones de git

- Conventional commits, **sin atribución de IA / Co-Authored-By**.
- Rama de trabajo: `main`.
