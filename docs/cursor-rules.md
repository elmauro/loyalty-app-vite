# Cursor rules – loyalty-app-vite (Frontend)

Practical rules for generating and updating code in this repository. Use together with `docs/project-context.md`.

---

## 1. Scope

- **In scope:** Only the frontend app under `loyalty-app-vite/`. Backend and infrastructure live in `loyalty-program-serverless/`; do not modify backend code from frontend-focused edits.
- **Routing and roles:** Route paths come from `src/routes/paths.ts`. Role IDs and default paths come from `src/constants/auth.ts`. Use these constants for links and redirects; do not hardcode paths or role GUIDs in components.
- **Environment:** All API and app configuration is read from `src/services/apiConfig.ts` and `import.meta.env` (VITE_*). Do not introduce new env keys without documenting them (e.g. in README or .env.example).

---

## 2. Architecture and structure rules

- **Folder structure:** Follow the existing layout. New pages go in `src/pages/<PageName>/<PageName>.tsx`. New feature components go under `src/components/` (either a new folder or an existing domain folder such as `rules/` or `program/`). UI primitives go in `src/components/ui/`. Do not create new top-level folders (e.g. `features/`, `hooks/`) unless the same pattern already exists.
- **Path aliases:** Use the existing aliases: `@/` for `src/`, `@components`, `@services`, `@types`, `@utils`. Import from `@/` or relative paths consistently with the rest of the file.
- **State:** Auth is the only global state (AuthContext in `src/store/AuthContext.tsx`). Do not add Redux, Zustand, or other global state libraries. Page/component state stays local (useState, useRef, useMemo).
- **New routes:** Add the route in `src/routes/AppRoutes.tsx`, the path constant in `src/routes/paths.ts`, and wrap protected routes with `ProtectedRoute` and the correct `allowedRoles` from `src/constants/auth.ts`.

---

## 3. Component and page rules

- **Pages:** One default-export component per page file, named to match the route (e.g. `Login`, `Administration`, `UserPage`). Place the file at `src/pages/<Name>/<Name>.tsx`.
- **UI:** Use components from `src/components/ui/` (button, input, label, select, dialog, card, tabs, etc.). Style with Tailwind and merge classes with `cn()` from `src/lib/utils.ts`. Do not introduce CSS modules or styled-components; the project uses Tailwind and design tokens in `src/index.css`.
- **Forms:** Use native form elements and `FormData` for values where the rest of the app does (e.g. `e.currentTarget`, `formData.get('fieldName')`). Use Radix components where the pattern exists (e.g. Select). Name submit handlers `handle*` (e.g. `handleSubmit`, `handleAccumulate`).
- **Feedback:** Use `toast` from `sonner` for success and error messages. Do not add another toast library.
- **Icons:** Use `lucide-react`; do not add a different icon set without a clear reason.

---

## 4. Service / API integration rules

- **No hardcoded URLs or secrets:** All base URLs, paths, and API keys come from `src/services/apiConfig.ts`. When adding a new endpoint, add the path (or reuse an existing one) in apiConfig and use it in the service.
- **Axios instances:** Use `axiosAuth` for auth endpoints (`/api/authentications`) and `axiosApp` for all other APIs (transactions, rules, admin, tenant). Do not create a new axios instance unless the pattern exists for a distinct backend.
- **Services:** Put API calls in `src/services/`. Export async functions that return typed data or throw. Use types from `src/types/` for request/response shapes. Keep request/response aligned with backend Swagger; when the backend contract changes, update the service and types first.
- **Error handling:** In components that call services, catch errors and use `getErrorStatus()` from `src/utils/getErrorStatus.ts`. Use existing domain helpers where they exist: `getAccumulationErrorMessage`, `getRedemptionErrorMessage`, `getLoginErrorMessage`. Add a similar helper for a new domain rather than inlining status-to-message logic. Show the message with `toast.error()`.
- **Contract changes:** When an API contract changes (new/removed/renamed fields, new status codes), update the corresponding service, types in `src/types/`, and any MSW handlers and tests that depend on that contract.

---

## 5. Testing rules

- **Unit tests:** Place tests in `__tests__` next to the component (e.g. `AccumulationForm/__tests__/AccumulationForm.test.tsx`). Use `renderWithProviders` from `src/test-utils.tsx` so AuthProvider, BrowserRouter, and Toaster are available. Do not add new global mocks in `setupTests.ts` unless necessary (e.g. for a new global dependency); prefer mocking at the test or module level.
- **Selectors:** Prefer `data-testid` for elements that tests need to target. Use the same `data-testid` pattern as existing components (e.g. `acc-document`, `red-points`, `login-username`). Add `data-testid` when adding new interactive elements that will be asserted on.
- **Service/API mocks in unit tests:** Mock the service module (e.g. `jest.mock('../../../services/transactionService')`) or axios, not MSW. Use `getMockResponse()` from `src/mocks/mockService.ts` for response shapes when it fits the entity.
- **MSW (E2E):** Handlers in `src/mocks/handlers/` must match the real endpoint paths and expected status codes used by the app. When changing a service URL or request/response shape, update the corresponding handler and, if needed, mock data in `src/mocks/data/`. Keep handler logic aligned with the behavior described in `docs/testing/GUIA-ALINEACION-E2E-SWAGGER-FRONTEND.md`.
- **E2E specs:** Cypress specs live in `cypress/e2e/`. Use the existing custom commands (`loginAsAdmin`, `loginAsProgramAdmin`, `loginAsUser`) for role-based flows. When adding a new flow that depends on an API, add or adjust the MSW handler and the E2E spec; do not rely on the real backend in default E2E runs unless the script explicitly targets real backend (e.g. `cy:e2e:real`).

---

## 6. Documentation update rules

- **When changing API usage or contracts:** Update `docs/testing/GUIA-ALINEACION-E2E-SWAGGER-FRONTEND.md` if the mapping between E2E scenarios and endpoints changes.
- **When changing deployment or CI:** Update `docs/infrastructure/` (e.g. GUIA-DESPLIEGUE-AWS-FRONTEND.md) if build, env, or deploy steps change.
- **When adding a feature that has a requirement doc:** Add or update the relevant doc under `docs/templates/` or `docs/` (e.g. transaction types, new flows).
- **Do not:** Invent or update architecture docs (e.g. in `docs/architecture/`) unless the repo already has such docs and the change is substantive.

---

## 7. Refactoring rules

- **Before creating new structure:** Prefer reusing existing folders and patterns. For example, a new admin screen may belong in an existing page or under `src/components/program/` or a similar domain folder.
- **Naming:** Match existing naming: PascalCase for components and pages, camelCase for functions and variables, `handle*` for event handlers, service names like `*Service.ts` and function names that describe the operation (e.g. `accumulatePoints`, `getRules`).
- **Moving or renaming:** If you move a component or page, update imports (including in AppRoutes and tests). If you rename a route, update `paths.ts`, `AppRoutes.tsx`, and any links or redirects that use it.
- **Mocks and tests:** After refactoring, ensure MSW handlers and unit/E2E tests still match the current endpoints and UI (selectors, roles). Run the relevant test commands to confirm.

---

## 8. What Cursor should avoid doing in this repo

- **Do not add global state libraries** (Redux, Zustand, Jotai, etc.). Auth is the only global state (AuthContext).
- **Do not add a server-state/cache library** (e.g. React Query, SWR) unless the team has decided to adopt it; the app uses direct service calls and local state.
- **Do not hardcode API base URLs, paths, or secrets** in components or services. Use `apiConfig.ts` and env.
- **Do not introduce a new UI or styling approach** (CSS modules, styled-components, another icon set) without evidence it is already used or agreed.
- **Do not change backend code** (loyalty-program-serverless) when the task is frontend-only. Only reference backend contracts (e.g. Swagger) to align request/response and docs.
- **Do not add generic “best practice” comments** (e.g. “always use TypeScript”) that do not reflect a concrete repo convention.
- **Do not remove or bypass existing conventions** (e.g. ProtectedRoute, paths.ts, apiConfig, toast for errors) to implement a feature; extend them if needed.
- **Do not add unit tests that call the real API or MSW** unless the test is explicitly for integration; unit tests should mock services or axios.
