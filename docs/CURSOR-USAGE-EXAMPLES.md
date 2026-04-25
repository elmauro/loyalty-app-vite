# Using Cursor with this repository

**Canonical** context and rules for Cursor live in the **loyalty-cursor** repository (sibling to this repo in the monorepo):

- **loyalty-cursor/projects/loyalty-frontend/project-context.md** – system overview, pages, services, state, testing
- **loyalty-cursor/projects/loyalty-frontend/cursor-rules.md** – implementation rules and conventions

In prompts, use `@` with paths under the **loyalty-cursor** repository (this repo does not duplicate those files).

---

## 1. Backend examples (other repository)

When you need to prompt for changes in the backend repository (loyalty-program-serverless), use **loyalty-cursor** for AI context: `loyalty-cursor/projects/loyalty-backend/project-context.md`, `cursor-rules.md`, and in the backend repo for handler/serverless details `loyalty-program-serverless/docs/development/ESTANDAR_FUNCIONES_LAMBDA.md`, `ESTANDAR-SERVERLESS-YML.md`.

---

## 2. Frontend examples

### Example 1 — Updating a frontend service after backend change

```
@loyalty-cursor/projects/loyalty-frontend/project-context.md
@loyalty-cursor/projects/loyalty-frontend/cursor-rules.md
@docs/testing/GUIA-ALINEACION-E2E-SWAGGER-FRONTEND.md

Update the frontend transactionService according to the backend contract change.

Tasks:
- update the service method
- update the request and response types
- update MSW handlers if necessary
- update affected unit tests
```

### Example 2 — Creating a new page

```
@loyalty-cursor/projects/loyalty-frontend/project-context.md
@loyalty-cursor/projects/loyalty-frontend/cursor-rules.md

Create a new admin page to display expiring points.

Requirements:
- follow the existing page structure
- place the page under src/pages/
- add the route in AppRoutes.tsx
- use path constants from paths.ts
- use UI primitives from components/ui
```

### Example 3 — Updating UI behavior

```
@loyalty-cursor/projects/loyalty-frontend/project-context.md
@loyalty-cursor/projects/loyalty-frontend/cursor-rules.md

Improve the RedemptionForm UX.

Tasks:
- keep the existing form structure
- use Tailwind classes
- use toast notifications for errors
- keep service integration unchanged
```

### Example 4 — Updating E2E tests

```
@loyalty-cursor/projects/loyalty-frontend/project-context.md
@loyalty-cursor/projects/loyalty-frontend/cursor-rules.md
@docs/testing/GUIA-ALINEACION-E2E-SWAGGER-FRONTEND.md

Update the Cypress E2E test for redemption flow.

Tasks:
- adjust selectors if needed
- update MSW handlers
- keep the existing login commands
```

---

## 3. Full-stack (frontend + backend)

When aligning both repositories (e.g. both open in the same workspace), reference this repo’s docs and the backend repo’s docs in a single prompt:

```
@loyalty-cursor/projects/loyalty-frontend/project-context.md
@loyalty-cursor/projects/loyalty-frontend/cursor-rules.md
@loyalty-cursor/projects/loyalty-backend/project-context.md
@loyalty-cursor/projects/loyalty-backend/cursor-rules.md

The backend expense API changed.

Update the frontend and backend accordingly:
- backend Swagger
- frontend service
- types
- MSW handlers
- tests
```

Replace the bracketed part with the actual path to the backend repository’s docs if your workspace uses a different folder name.
