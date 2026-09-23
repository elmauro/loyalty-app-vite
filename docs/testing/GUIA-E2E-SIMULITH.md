# E2E contra Simulith local

Ejecuta Cypress contra el stack Loyaleasy en **Simulith Docker** (no MSW). Los fallos se registran en [E2E-SIMULITH-BACKLOG.md](./E2E-SIMULITH-BACKLOG.md).

**Plan maestro (migración + MSW):** [PLAN-E2E-SIMULITH-MSW.md](./PLAN-E2E-SIMULITH-MSW.md)

## Pre-requisitos

1. Simulith en `:4567` — `curl -s "$ENDPOINT/health"` → `{"status":"ok"}`
2. Infra + seed + backend + `bootstrap-test-users-simulith.sh` (ver [SEED_SIMULITH.md](../../../loyalty-program-serverless/docs/infrastructure/SEED_SIMULITH.md))
3. **Hosts:** `127.0.0.1 dev.loyaleasy.com` en `C:\Windows\System32\drivers\etc\hosts`
4. Usuarios Cognito: `tenant.admin@loyaleasy.test` / `Test1234!` (y program admin, customer)

## Comandos

```bash
cd loyalty-app-vite

# Headless — suite Simulith (sin auth-flows mock-only)
npm run cy:e2e:run:simulith

# UI interactiva
npm run cy:e2e:simulith

# Solo login contra Simulith
npm run cy:e2e:run:simulith:login

# Regresión rápida MSW (sin Simulith)
npm run cy:e2e:run
```

`cy:e2e:run:simulith` ejecuta:

1. `prepare-simulith-e2e-env.sh` (health + env; opcional si ya desplegaste)
2. Cypress contra **SPA desplegada** en `http://dev.loyaleasy.com:4567` (mismo origen que API/Cognito)
3. `BACKEND=simulith` → login real vía UI

> **Importante:** Login Cognito **falla** desde Vite dev `:51730` (origen distinto al API `:4567`). Usa `npm run deploy:simulith` antes del primer run, o `cy:e2e:run:simulith:vite-dev` solo para depurar CORS.

## MSW vs Simulith

| | MSW (`cy:e2e:run`) | Simulith (`cy:e2e:run:simulith`) |
| --- | --- | --- |
| Login | localStorage mock / doc 8288221 | Cognito email + UI |
| API | Interceptada | `http://dev.loyaleasy.com:4567` |
| Auth flows spec | Sí | Omitido |
| Objetivo | Regresión UI rápida | Contrato real + paridad Simulith |

## Cuando falla un test

1. Reproduce manualmente en `http://dev.loyaleasy.com:4567` o en Cypress UI
2. Anota en [E2E-SIMULITH-BACKLOG.md](./E2E-SIMULITH-BACKLOG.md): spec, síntoma, owner
3. Corrige en **simulith**, **backend**, **seed** o **spec** — no silencies el test sin clasificar

## Seed y datos E2E

Fixtures Cypress: `cypress/fixtures/simulith-users.json`, `simulith-e2e-data.json`.  
Fuente de verdad backend: `loyalty-program-serverless/infrastructure/scripts/test-users.simulith.json`, `dynamodb/otp.json`.

Si acumulación/canje fallan por datos, extiende seed o ajusta fixtures — documenta en el backlog.

### Acumulación (`accumulation.cy.ts`)

- **Documento:** `10000003` (customer bootstrap en `test-users.simulith.json`)
- **Valor mínimo:** ≥ `conversionValue` del tenant Comfama (**1000**); fixture usa **5000**
- **Oficina:** el test espera `admin-office-select` y botón Acumular habilitado
- **Backend:** requiere `transaction-api` (income) + PostgreSQL migrado → `migrate-db-simulith.sh` en serverless

## Relacionado

- [GUIA-ALINEACION-E2E-SWAGGER-FRONTEND.md](./GUIA-ALINEACION-E2E-SWAGGER-FRONTEND.md)
- [GUIA-DESPLIEGUE-SIMULITH.md](../infrastructure/GUIA-DESPLIEGUE-SIMULITH.md)
