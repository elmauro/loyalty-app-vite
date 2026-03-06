# Project context – loyalty-app-vite (Frontend)

This document describes the **loyalty-app-vite** frontend application as it exists in the repository. It is intended for maintainers and for AI tools (e.g. Cursor) to understand the architecture, conventions, and workflows without guessing.

---

## 1. Project overview

**loyalty-app-vite** is the frontend of a loyalty (fidelización) platform. It is a single-page application (SPA) built with React, TypeScript, and Vite. It runs in the same repository as the backend (`loyalty-program-serverless`), which provides serverless APIs (Lambda, API Gateway). The frontend communicates with those APIs over HTTPS; it does not contain backend or infrastructure code.

---

## 2. Main purpose of the frontend

The app supports:

- **Authentication:** Login (traditional and optional Cognito), registration, forgot/reset password, change password.
- **Customer flows:** Accumulation of points (income), redemption of points (expense with OTP), and transaction history with pagination and filters (Todo / Acumulado / Redimido).
- **Admin flows:** Full administration (accumulation, redemption, history) for administrators; program administration (program config, tenants, tenant admins, transaction types) for program admins; rules management (engine-api: GET/PUT JSON rules by transaction type).

Roles are enforced by route: **Administrator** (`ROLE_ADMIN`), **Customer** (`ROLE_CUSTOMER`), **Program Admin** (`ROLE_PROGRAM_ADMIN`). Role GUIDs and default paths are defined in `src/constants/auth.ts`.

---

## 3. Main technologies and tools

| Category        | Technology |
|----------------|------------|
| Runtime / build | Node.js, Vite 6 |
| UI framework    | React 18 |
| Language        | TypeScript 5 |
| Routing         | react-router-dom 7 |
| HTTP client     | Axios |
| Auth (optional) | amazon-cognito-identity-js |
| UI components   | Radix UI (Alert Dialog, Checkbox, Dialog, Label, Select, Separator, Slot, Switch, Tabs, Tooltip) |
| Styling         | Tailwind CSS 3, tailwind-merge, clsx, class-variance-authority |
| Icons           | lucide-react |
| Toasts          | sonner |
| Unit tests      | Jest 29, ts-jest, @testing-library/react, jsdom |
| E2E tests       | Cypress 14, cypress-vite, start-server-and-test |
| API mocking (E2E) | MSW 2 (only when `VITE_USE_MSW=true`) |

The app uses **ES modules** (`"type": "module"` in `package.json`). Vite is the dev server and bundler; Jest is configured with `ts-jest` in ESM mode and a dedicated `tsconfig.jest.json`.

---

## 4. Folder / module structure

```
loyalty-app-vite/
├── cypress/                 # E2E tests and support
│   ├── e2e/                 # Specs: login, auth-flows, accumulation, redemption, transaction-history, user, rules, program-administration
│   ├── fixtures/
│   └── support/             # commands.ts (loginAsAdmin, loginAsProgramAdmin, loginAsUser), e2e.ts, e2e.d.ts
├── docs/                    # Documentation (reorganized)
│   ├── architecture/
│   ├── api/
│   ├── development/
│   ├── testing/
│   ├── infrastructure/
│   ├── analysis/
│   ├── templates/
│   ├── README.md            # Index of doc folders
│   ├── project-context.md   # This file
│   └── cursor-rules.md
├── public/                  # Static assets; mockServiceWorker.js for MSW
├── src/
│   ├── components/          # Feature and UI components
│   │   ├── ui/              # Primitive components (button, input, select, dialog, card, tabs, etc.)
│   │   ├── AccumulationForm/
│   │   ├── RedemptionForm/
│   │   ├── TransactionHistoryForm/
│   │   ├── TransactionsTable/
│   │   ├── TopBar/
│   │   ├── rules/           # RulesManager, RuleCard, RuleFormDialog, FactsManager, ConditionBadge
│   │   └── program/         # ProgramConfigForm, TenantsManager, TenantAdminsManager
│   ├── constants/           # auth.ts (roles, default paths), rules.ts, pagination.ts
│   ├── layouts/             # ProtectedLayout (TopBar + Outlet)
│   ├── lib/                 # utils.ts (cn for Tailwind)
│   ├── mocks/               # MSW handlers and mock data (only used when VITE_USE_MSW=true)
│   │   ├── browser.ts       # Service worker setup
│   │   ├── handlers/        # authHandlers, otpHandlers, transactionHandlers, rulesHandlers, programHandlers
│   │   ├── data/             # JSON: auth, common, transactions, accumulations, redemptions, rules
│   │   └── mockService.ts    # getMockResponse(entity, type)
│   ├── pages/               # Route-level components
│   ├── routes/              # AppRoutes, paths, ProtectedRoute
│   ├── services/            # API clients and business API calls
│   ├── store/               # AuthContext (useReducer + context)
│   ├── types/               # Transaction, Auth, program, rules
│   ├── utils/               # token (JWT decode, tenant, buildUserFromToken), getErrorStatus, getAccumulationErrorMessage, getRedemptionErrorMessage
│   ├── App.tsx
│   ├── main.tsx             # AuthProvider, enableMocking(), render
│   ├── enableMocking.ts     # Starts MSW only if VITE_USE_MSW=true
│   ├── setupTests.ts        # Jest: jest-dom, ResizeObserver mock, apiConfig mock
│   ├── test-utils.tsx       # renderWithProviders (AuthProvider, BrowserRouter, Toaster)
│   ├── index.css            # Tailwind + design tokens (HSL variables)
│   ├── polyfills.ts
│   └── vite-env.d.ts
├── index.html
├── package.json
├── vite.config.ts           # envPrefix VITE_, proxy rules, path aliases
├── tailwind.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.jest.json
├── jest.config.ts
└── README.md
```

**Path aliases (Vite):** `@` → `src`, `@components` → `src/components`, `@services` → `src/services`, `@types` → `src/types`, `@utils` → `src/utils`. Jest maps `@/` to `src/` via `moduleNameMapper`.

---

## 5. Main architectural patterns

- **Single SPA:** One React tree; routing via `react-router-dom` with `BrowserRouter`. Public routes (home, login, registration, forgot/reset password) and protected routes (administration, user, rules, program-administration, change-password) are defined in `AppRoutes.tsx`. Protected routes are wrapped in `ProtectedLayout` (TopBar + main content) and `ProtectedRoute` (role check; redirect to `/login` if unauthorized).
- **State:** No global state library. Auth is held in React Context (`AuthContext`) with a reducer (LOGIN, LOGOUT, STOP_LOADING). User is restored from `localStorage` on load (`authData`). Page-level state is local (useState/useRef/useMemo); no Redux or Zustand.
- **API access:** All backend calls go through services in `src/services/`. Two Axios instances: `axiosAuth` (auth API base) and `axiosApp` (app/transaction/rules/admin/tenant APIs). Base URLs and paths come from `apiConfig.ts` (env: `VITE_API_BASE_AUTH`, `VITE_API_BASE_APP`, etc.). Interceptors add `x-program-id`, `x-api-key`, and when present `x-access-token`; they also handle 401/403 (toast + redirect to login) and other errors (toast). Token and tenant for requests are read from `utils/token.ts` (localStorage + JWT decode).
- **Component structure:** Pages compose layout and feature components. Feature components (e.g. AccumulationForm, RedemptionForm, RulesManager) call services directly. UI primitives live under `components/ui/` and use Tailwind + `cn()` from `lib/utils.ts`. Forms use native form elements plus Radix where needed (e.g. Select).
- **Errors:** Services throw; components catch and use `getErrorStatus()` and domain-specific helpers (`getAccumulationErrorMessage`, `getRedemptionErrorMessage`) to show user-facing messages via `toast` (sonner).

---

## 6. Pages, components, services, state, mocks, tests, styles

**Pages (route targets):** Home, Login, Registration, ForgotPassword, ResetPassword, ChangePassword, Administration, ProgramAdministration, Rules, User. Each lives in `src/pages/<Name>/<Name>.tsx`.

**Components:** Feature components are co-located with their domain (AccumulationForm, RedemptionForm, TransactionHistoryForm, TransactionsTable; rules/*; program/*). Shared layout: TopBar, ProtectedLayout. UI primitives are in `components/ui/` (button, input, label, select, dialog, card, tabs, tooltip, sonner, etc.).

**Services:** `authService` (login, loginWithCognitoToken), `transactionService` (accumulatePoints, redeemPoints, getTransactions, getPoints, getExpiringPoints), `rulesService` (getRules, updateRules), `programService` (program config, transaction types), `tenantService`, `tenantAdminService`, `otpService`, `cognitoService`. They use `axiosAuth` or `axiosApp` and types from `src/types/`.

**State:** Auth in AuthContext; everything else is local to pages/components (useState, useRef, useMemo). No shared server state library (e.g. React Query) in the repo.

**Mocks:** MSW is used only when `VITE_USE_MSW=true` (e.g. `npm run cy:e2e`). Handlers are in `src/mocks/handlers/`; JSON fixtures in `src/mocks/data/`. `enableMocking()` in `main.tsx` starts the worker; in normal dev or production, MSW is not started and the app talks to the real backend.

**Unit tests:** Jest; entry via `setupTests.ts` (jest-dom, ResizeObserver mock, full `apiConfig` mock to avoid `import.meta.env` in tests). Tests live in `__tests__` next to components (e.g. `AccumulationForm/__tests__/AccumulationForm.test.tsx`). `test-utils.tsx` provides `renderWithProviders` (AuthProvider, BrowserRouter, Toaster). Tests are excluded from Cypress (`testPathIgnorePatterns: ['/cypress/']`).

**E2E tests:** Cypress in `cypress/e2e/` (login, auth-flows, accumulation, redemption, transaction-history, user, rules, program-administration). By default they run with MSW (`cy:e2e` uses `VITE_USE_MSW=true`); `cy:e2e:real` runs against the real backend. Custom commands in `cypress/support/commands.ts`: `loginAsAdmin`, `loginAsProgramAdmin`, `loginAsUser` (set `authData` in localStorage and visit the role-specific path).

**Styles:** Tailwind; design tokens in `src/index.css` (HSL CSS variables: `--background`, `--foreground`, `--primary`, `--accent`, etc.). Emerald green and gold/amber are used as primary and accent. Components use Tailwind classes and `cn()` for conditional classes. No CSS modules or styled-components in the inspected code.

---

## 7. API integration approach

- **Configuration:** `src/services/apiConfig.ts` reads `import.meta.env` (VITE_*). It defines API bases (`API_BASE_AUTH`, `API_BASE_APP`), program id, API key, paths for rules, tenants, admin, transaction-type headers, phone country code, and optional Cognito ids. When `VITE_USE_MSW=true`, bases are forced to `''` so requests hit the same origin and MSW can intercept.
- **Clients:** `axiosAuth` and `axiosApp` in `axiosInstance.ts` apply the same interceptors (headers, error toasts, 401/403 redirect to login). Some paths (income, rules, tenant/admin) omit `x-api-key` by design (see comments in code).
- **Conventions:** Services export async functions that return typed data or throw. Request bodies and responses are aligned with backend Swagger; types in `src/types/` (Transaction, Auth, program, rules) reflect that. No generated API client; services call axios methods with explicit URLs and headers (paths from apiConfig).
- **Backend alignment:** The repo expects backend APIs as documented in `loyalty-program-serverless` (e.g. auth, income, expense, history, points, rules, admin, tenant). E2E and Swagger alignment are described in `docs/testing/E2E-SWAGGER-ALINEACION.md`.

---

## 8. Testing approach

- **Unit:** Jest + React Testing Library. `apiConfig` is mocked in `setupTests.ts` so tests do not depend on Vite env. ResizeObserver is mocked for Radix components. Prefer `data-testid` for stable selectors where used (e.g. AccumulationForm, RedemptionForm, Login, Rules, User). Run unit tests with Jest (e.g. `npx jest`); no `test` script is defined in `package.json`.
- **E2E:** Cypress. Default runs use MSW; optional “real” runs hit the backend. Port 51730; app started with `cy:dev` or `cy:dev:real`. Scripts: `cy:e2e`, `cy:e2e:run`, `cy:e2e:run:rules`, `cy:e2e:run:program-admin`, `cy:e2e:real`, `cy:e2e:run:real`. E2E scenarios are mapped to backend endpoints and Swagger in `docs/testing/E2E-SWAGGER-ALINEACION.md`.

---

## 9. Documentation structure

After reorganization, docs live under `docs/`:

- **architecture/** – High-level design (if present).
- **api/** – API usage and contracts from frontend perspective (if present).
- **development/** – Coding standards (if present).
- **testing/** – E2E and Swagger alignment (`E2E-SWAGGER-ALINEACION.md`).
- **infrastructure/** – Deployment (e.g. `DEPLOY-AWS.md`: GitHub Actions, S3, CloudFront, Route 53).
- **analysis/** – Security and other analyses (`SECURITY-ANALYSIS.md`).
- **templates/** – Requirement docs (e.g. `REQUERIMIENTO-TRANSACTION-TYPES-LOVABLE.md`).

`docs/README.md` is the index. Root README points to key flows and deployment; some links may still reference old paths (e.g. `docs/DEPLOY-AWS.md` → now `docs/infrastructure/DEPLOY-AWS.md`).

---

## 10. Development workflow expectations (inferred)

- **Environment:** Use `.env` (or `.env.local`) with `VITE_*` for API bases, program id, API key, Cognito, etc. In dev without env, Vite proxy sends `/api` and transaction/rules/admin paths to configured backends (see `vite.config.ts`).
- **Backend first:** When changing both frontend and backend, deploy backend before frontend so API contracts and env are in place (stated in `docs/infrastructure/DEPLOY-AWS.md`).
- **E2E:** Default E2E runs are against MSW; for contract validation against the real API, use the “real” Cypress scripts and ensure backend is up and env is set.
- **Linting:** `npm run lint` (ESLint). No pre-commit hooks were observed in the inspected files.

---

## 11. Key conventions for new changes

- **Paths:** Use the route constants from `src/routes/paths.ts` for links and redirects.
- **Roles:** Use role GUIDs and helpers from `src/constants/auth.ts`; protect routes via `ProtectedRoute` and `allowedRoles`.
- **API:** Do not hardcode base URLs or secrets; use `apiConfig.ts` and env. Add or adjust types in `src/types/` when request/response shapes change.
- **Errors:** Use `getErrorStatus()` and the existing error-message helpers where applicable; show user feedback via `toast` (sonner).
- **Tests:** Prefer `data-testid` for elements that tests need to target; keep MSW handlers and E2E specs in sync with backend contracts (see `docs/testing/E2E-SWAGGER-ALINEACION.md`).
- **UI:** Use `components/ui/` primitives and Tailwind; merge classes with `cn()` from `lib/utils.ts`. Follow the existing design tokens in `index.css`.
- **New features:** If they touch APIs or deployment, update the relevant doc under `docs/` (testing, infrastructure, or templates).

---

## 12. How to use this document with Cursor

- **Context:** When working in `loyalty-app-vite`, point Cursor at this file so it knows this is the frontend app, its stack (React, Vite, TypeScript, Tailwind, Radix), and where pages, services, components, and tests live.
- **Conventions:** Section 11 summarizes conventions; `docs/cursor-rules.md` adds short rules (e.g. API alignment, E2E/Swagger, no hardcoded config).
- **APIs:** For request/response shapes and which service talks to which backend, use this doc plus `src/services/` and `src/types/`. For backend contract details and E2E mapping, use `docs/testing/E2E-SWAGGER-ALINEACION.md` and the backend repo’s Swagger docs.
- **Uncertainty:** Where something was inferred (e.g. “no React Query” or “no pre-commit hooks”), it is stated in the text. If the repo changes, update this file so Cursor and humans stay aligned with the actual codebase.
