# Feature Manifest — Historial: fechas zona programa y carga inicial

## Feature

- Name: Historial: fechas zona programa y carga inicial
- Slug: historial-fechas-zona-programa-y-carga-inicial
- Ticket/story: n/a
- Stack scope: frontend (slice UI; backend en repo serverless)

## Status

- Current stage: validation

## Paquete backend (misma feature, otro repo)

`loyalty-program-serverless/cursor/analysis/features/backend/historial-fechas-zona-programa-y-carga-inicial/`

Contrato HIS-07/HIS-08, `historyDateRange.js`, **layer-transversal** + rebuild: documentados allí.

## TARGET SCOPE (este repo)

- Frontend: `User.tsx`, `TransactionHistoryForm`, `dateRangePresets`, empty hints, tests UI

## Validation plan

- Run tests: yes
- Frontend: `npm run test -- --testPathPattern=TransactionHistory`
- Backend (repo serverless): ver manifest en `loyalty-program-serverless/.../backend/historial-fechas-zona-programa-y-carga-inicial/`
- Manual: Mi Cuenta Simulith tras acumulación mismo día (requiere deploy backend)

## Documents

- user-story.md — done
- analysis.md — done
- implementation-notes.md — done
