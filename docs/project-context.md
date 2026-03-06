# Project context – loyalty-app-vite (Frontend)

## System overview

This repository contains the **frontend** of a loyalty (fidelización) application. It is a React SPA that allows users to accumulate points, redeem points, view history, and manage program rules. It works together with the backend in `loyalty-program-serverless` (same repo root).

## Main technologies

- **React** + **TypeScript**
- **Vite** (build and dev server)
- **Testing:** Jest (unit), Cypress (e2e)
- **UI:** Radix UI–based components

## Architecture summary

- Single-page application that talks to serverless APIs via REST.
- Main flows: accumulation (income), redemption (expense), history, points balance, transaction types, and rules (engine-api).
- Backend base URLs and program id are configured via environment (e.g. `import.meta.env`); see `src/services/apiConfig`.

## How frontend and backend interact

- The frontend calls APIs under `loyalty-program-serverless` (auth-api, admin-api, tenant-api, engine-api, email-api, otp-api, transaction-api).
- API contracts are defined in Swagger/OpenAPI files in the backend (`*/docs/**/swagger.yaml`).
- E2E and UI should stay aligned with those contracts; see `docs/testing/E2E-SWAGGER-ALINEACION.md` (after reorganization).

## Documentation structure (after reorganization)

- **architecture/** – High-level design and module structure.
- **api/** – API usage and contracts from frontend perspective.
- **development/** – Coding standards and conventions.
- **testing/** – E2E, unit tests, and alignment with Swagger.
- **infrastructure/** – Deployment (e.g. AWS S3/CloudFront), CI/CD.
- **analysis/** – Security, feasibility, and other analyses.
- **templates/** – Requirement and feature templates.
