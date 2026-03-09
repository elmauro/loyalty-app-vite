# Using Cursor with this repository

This repository includes two files to help AI tools (such as Cursor) understand the architecture and conventions:

- **docs/project-context.md** – system overview, pages, services, state, testing
- **docs/cursor-rules.md** – implementation rules and conventions

When generating or updating code, reference these files explicitly in your prompt so the AI follows the project structure and rules.

---

## 1. Backend examples (other repository)

When you need to prompt for changes in the backend repository (loyalty-program-serverless), use that repo’s docs: `@docs/project-context.md`, `@docs/cursor-rules.md`, and for handler/serverless details `@docs/development/ESTANDAR_FUNCIONES_LAMBDA.md`, `@docs/development/ESTANDAR-SERVERLESS-YML.md`. Example prompts: update an API endpoint and Swagger; create a new Lambda function; refactor a service without changing the contract; update docs after an API change.

---

## 2. Frontend examples

### Example 1 — Updating a frontend service after backend change

```
@docs/project-context.md
@docs/cursor-rules.md
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
@docs/project-context.md
@docs/cursor-rules.md

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
@docs/project-context.md
@docs/cursor-rules.md

Improve the RedemptionForm UX.

Tasks:
- keep the existing form structure
- use Tailwind classes
- use toast notifications for errors
- keep service integration unchanged
```

### Example 4 — Updating E2E tests

```
@docs/project-context.md
@docs/cursor-rules.md
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
@docs/project-context.md
@docs/cursor-rules.md
[+ backend repo: docs/project-context.md, docs/cursor-rules.md]

The backend expense API changed.

Update the frontend and backend accordingly:
- backend Swagger
- frontend service
- types
- MSW handlers
- tests
```

Replace the bracketed part with the actual path to the backend repository’s docs if your workspace uses a different folder name.
