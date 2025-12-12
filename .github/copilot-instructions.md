# Copilot instructions (neshopify)

## Big picture
- Monorepo with 3 apps:
  - `client-frontend/` — Next.js (App Router) site builder (конструктор сайтов) + preview routes.
  - `admin-frontend/` — Vite + React + Mantine admin panel (React Router).
  - `new-backend/` — the only backend: NestJS API (REST under `/api/*`, Swagger at `/docs`).

## Run / dev
- `client-frontend/`: `npm i` then `npm run dev` (Next dev server on `:3000`).
- `admin-frontend/`: `npm i` then `npm run dev` (Vite). Local mock API: `npm run dev:full` (runs Vite + `json-server` on `:3001`).
- `new-backend/`: `npm i` then `npm run start:dev` (Nest, default port `5000`). Requires env:
  - `DATABASE_URL`, `CLIENT_URL` (can be comma-separated for CORS), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, optional `JWT_*_TTL`.

## API contracts & auth (client/admin ↔ new-backend)
- Nest global prefix is set in `new-backend/src/main.ts` → all routes are `/api/...`.
- Auth is cookie-based:
  - `POST /api/auth/login|register|refresh` sets `accessToken` + `refreshToken` HttpOnly cookies.
  - Frontends still read `accessToken` from JSON response to populate stores, but requests authenticate via cookies.
  - Axios is configured with `withCredentials: true` and a `401` interceptor that calls `/auth/refresh` then retries.
    - Client: `client-frontend/src/lib/config/httpConfig.ts` (supports `x-skip-auth-redirect` to prevent redirect loops).
    - Admin: `admin-frontend/src/shared/config/httpConfig.ts`.
- Role checks on backend use `@Roles(...)` + `RolesGuard` and, for site-scoped resources, `@SiteAccess(...)` + `SiteAccessGuard`.
  - Example: `new-backend/src/modules/catalog/controllers/products.controller.ts`.

## Frontend conventions
- Path alias `@/*` points to `src/*` (see `client-frontend/tsconfig.json`).
- Data fetching:
  - Use TanStack React Query; root provider is `client-frontend/src/components/providers/query-provider.tsx`.
  - API wrappers are small static classes in `client-frontend/src/lib/api/*.ts` (e.g. `SitesApi`, `ProductsApi`).
- Auth state:
  - `client-frontend`: Zustand store `client-frontend/src/stores/useAuthStore.ts` + guards `client-frontend/src/components/providers/require-auth.tsx` and `check-auth-welcome.tsx`.
  - `admin-frontend`: Zustand store `admin-frontend/src/app/stores/useAuth.ts` + route guard `admin-frontend/src/app/hoc/RequireAuth.tsx`.

## Backend conventions (new-backend)
- Prisma:
  - schema: `new-backend/prisma/schema.prisma` (PostgreSQL).
  - generated client output: `new-backend/generated/prisma/*`.
  - `PrismaService` hides `User.passwordHash` by default (`omit`) and manages connect/disconnect.
- Controllers are grouped under module folders like `new-backend/src/modules/catalog/controllers/*` and `.../services/*`.
- Pagination: endpoints often accept `page/limit/search` via `PaginationPipe` and respond using `ApiPaginatedResponse`.

## Legacy backend (ASP.NET Core)
- Minimal controllers under `Backend/NeshopifyAPI/Controllers/*` (e.g. `GoodsController`, `BasketItemController`).
- Connection string is in `Backend/NeshopifyAPI/appsettings.json` and points to local SQL Server; treat as machine-specific.

## When editing
- Prefer integrating with `new-backend/` endpoints used by `client-frontend/src/lib/api/*`.
- Keep auth/cookies behavior consistent: always use `withCredentials` for API calls and avoid adding token-in-header logic unless existing code already does it.
