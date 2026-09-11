# Review Guidelines — Loyalty

Use this file for human or AI-led reviews. Calibrate the depth: hotfixes can skip nice-to-haves, but full-stack features and contract changes need the full pass.

## Purpose

Use together with the rule packs:

- `@cursor/projects/backend/cursor-rules.md`
- `@cursor/projects/backend/cursor-rules-api.md` when HTTP, Lambda, Swagger, layers or Serverless are in scope
- `@cursor/projects/frontend/cursor-rules-frontend.md`
- `@cursor/projects/backend/project-context.md`
- `@cursor/projects/frontend/project-context.md`

`cursor-rules*` contains mandatory stack conventions. This file contains review habits, scope checks and cross-cutting quality heuristics.

---

## Core Principles

- Prefer existing Loyalty patterns before adding helpers, abstractions, components, services or new folders.
- Stay within the user story, bug report or approved analysis. Do not mix unrelated refactors into feature work.
- Search for same-domain examples before implementing: nearby Lambdas/services/docs on backend; nearby pages/components/services/tests on frontend.
- If one review finding applies to a pattern, scan the rest of the diff for the same issue.
- Intentional deviations from the story, analysis or existing pattern must be recorded in `implementation-notes.md`.
- Long-lived uncertainty belongs in `analysis.md`, `test-checklist.md` or `feature-manifest.md`, not only in chat.

---

## Correctness and Scope

- Implementation matches `user-story.md`, bug description or stated acceptance criteria.
- No extra endpoints, UI flows, roles, env vars or data changes unless explicitly requested.
- Edge cases are covered where relevant: null/empty values, missing headers, denied auth, stale tokens, idempotency, pagination, filters, empty result sets and duplicate submissions.
- Error paths return agreed shapes and status codes.
- Backend errors use typed errors and `handlingLmbError(err, event, context)` with `context`.
- Frontend errors use existing status helpers and `toast` patterns; 401 and 403 behavior remains aligned with `axiosInstance`.

---

## Backend Review

- Swagger and runtime behavior match: path, method, headers, body, response shape, status codes and examples.
- `REGLAS-NEGOCIO` is updated when validations, permissions, business rules or auth policy change.
- New or changed Lambdas follow handler → service → domain/DB or layer pattern; no business logic or manual response shaping in handlers.
- New functions include required Serverless wiring: warmer, authorizer/CORS where applicable, layers, config, package paths, custom domain and deploy script entry.
- Shared logic belongs in the right place: existing API service, domain helper or Lambda layer. Avoid single-use pass-through wrappers.
- Config/secrets come from config/SSM/env patterns already used; no hardcoded account IDs, API keys, secrets or URLs.
- Logging is useful for CloudWatch and does not leak tokens, credentials, OTPs or unnecessary PII.

---

## Frontend Review

- Routes use `src/routes/paths.ts`; roles use `src/constants/auth.ts`.
- API bases, paths and config go through `apiConfig.ts`; no hardcoded URLs or secrets in components/services.
- Services and `src/types` match backend Swagger and real response shapes.
- Components reuse `components/ui/`, Tailwind tokens and `cn()`; no new UI library, state library or styling system unless approved.
- Page/component state stays local unless an existing shared pattern applies; AuthContext remains the only global state.
- User-facing errors and success messages use existing helpers and `sonner` toast patterns.
- `data-testid` is present where unit or E2E tests need stable selectors.
- MSW handlers/data and Cypress specs stay aligned with changed endpoints and UI flows.

---

## Full-Stack Contracts

- Backend contract changes are implemented before frontend integration assumptions are locked in.
- Swagger, backend tests, frontend services/types, MSW handlers and Cypress scenarios agree on the same path, headers, body, status codes and response shape.
- Auth headers are reviewed explicitly: `x-program-id`, `x-access-token`, API key use and the authenticate exception.
- For rules/transactions/program changes, confirm affected transaction types, tenant/program context and role access.
- If a contract is intentionally incompatible with older behavior, record the reason in `implementation-notes.md` and the test impact in `test-checklist.md`.

---

## Tests and Validation

- Changed backend logic has focused unit or integration coverage where the repo already tests similar behavior.
- UI changes have unit tests or Cypress coverage when they affect critical flows, roles, forms, routing, errors or API integration.
- Default E2E expectations with MSW remain valid; real-backend validation is noted separately when used.
- `test-checklist.md` records what was run, what was not run, blocked checks and residual risks.
- Do not add tests that only assert implementation details while missing the user-visible behavior or API contract.

---

## Documentation and Artifacts

- Update only what the change invalidates: Swagger, `REGLAS-NEGOCIO`, README, runbooks, E2E alignment docs, `implementation-notes.md`, `test-checklist.md` or `feature-manifest.md`.
- Keep `loyalty-cursor` as the canonical place for AI context, rules, prompts and feature artifacts.
- If analysis discovers a broader issue that is out of scope, document it as a deferred item instead of silently expanding the implementation.

---

## Review Output Format

Lead with issues. For each finding include:

- severity: blocker | major | minor | suggestion
- issue: `<what is wrong>`
- evidence: `<file + symbol/function/component/doc>`
- violated rule/source: `<cursor rule, user story, Swagger, business rule, or guideline>`
- recommended fix: `<minimal fix>`

If no blocker/major issues are found, say that clearly and list remaining test gaps or risks.

---

## Practical Use

During implementation:

```text
Follow:
@cursor/projects/backend/cursor-rules.md
@cursor/projects/backend/cursor-rules-api.md
@cursor/projects/frontend/cursor-rules-frontend.md
@loyalty-cursor/analysis/shared/review-guidelines.md
```

For assisted review:

```text
@loyalty-cursor/analysis/shared/review-guidelines.md
@loyalty-cursor/analysis/features/<feature-slug>/user-story.md
@loyalty-cursor/analysis/features/<feature-slug>/implementation-notes.md

Review the implementation against the rule packs and these guidelines.
Lead with findings and cite files/symbols when possible.
```
