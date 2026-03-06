# Cursor / development rules – loyalty-app-vite (Frontend)

Use these as guidance when editing the frontend with AI tools (e.g. Cursor).

1. **API and backend alignment**
   - When changing flows that call the backend, keep behavior aligned with the API contracts (Swagger) defined in `loyalty-program-serverless`.
   - If you add or change API usage, consider whether E2E tests and Swagger need to be updated (see backend `docs/cursor-rules.md`).

2. **E2E and Swagger**
   - E2E tests should reflect the same request/response shape as the backend Swagger. When backend contracts change, update E2E and any frontend types/mocks accordingly.

3. **Coding standards**
   - Follow existing TypeScript and React patterns in the project (e.g. `apiConfig`, error handling, form patterns).
   - Prefer `data-testid` for stable selectors in tests.

4. **Configuration**
   - Do not hardcode API base URLs or secrets. Use `src/services/apiConfig` and environment variables.

5. **Documentation**
   - When adding features that touch APIs or deployment, update the relevant doc under `docs/` (e.g. testing, infrastructure, or templates).
