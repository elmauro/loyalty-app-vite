# E2E vs Simulith — backlog de fallos

Registra aquí cada fallo al ejecutar `npm run cy:e2e:run:simulith`. Clasifica el dueño antes de “arreglar el test”.

## Cómo ejecutar

```bash
# Simulith + backend + seed + bootstrap users (ver SEED_SIMULITH.md)
cd loyalty-app-vite
npm run cy:e2e:run:simulith
```

Ver [GUIA-E2E-SIMULITH.md](./GUIA-E2E-SIMULITH.md). Plan de fases: [PLAN-E2E-SIMULITH-MSW.md](./PLAN-E2E-SIMULITH-MSW.md).

## Clasificación

| Owner | Cuándo |
| --- | --- |
| **simulith** | Emulación AWS incorrecta (Cognito, Lambda, DynamoDB, etc.) |
| **loyaleasy-backend** | Handler, reglas de negocio, deploy, permisos IAM |
| **loyaleasy-seed** | Falta dato en DynamoDB/Postgres; extender `seed-simulith.sh` o bootstrap |
| **loyaleasy-frontend** | Bug UI o contrato API mal consumido |
| **e2e-test** | Spec asume MSW (mock login, textos, datos ficticios) |

## Registro

| Fecha | Spec | Caso | Error / síntoma | Owner | Issue / fix | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-03-23 | login.cy.ts | Cognito ×3 vía Vite :51730 | Tras submit queda en `/login` (timeout URL) | e2e-test | Usar SPA desplegada `:4567` como baseUrl; ver `cy:e2e:run:simulith` | fixed |
| 2026-03-23 | login.cy.ts | Cognito ×3 vía SPA :4567 | — | — | 8/8 pass (2 MSW skipped) | pass |
| 2026-03-23 | rules.cy.ts | Todos (7 tests + 4 skipped) | No aparece "Reglas de Bonificación" — spinner bloqueaba UI | loyaleasy-frontend | Rules.tsx sin gate; deploy SPA | fixed |
| 2026-03-23 | rules.cy.ts | Datos esperados | UI llama `jsonrule` hardcoded; seed PCM tenía nools (`1#sale-nools`) sin jsonrule | loyaleasy-seed | Seed: PCM `ruleEngine: jsonrule` + `#sale-jsonrule` con CompraGrande; re-run `seed-simulith.sh` | fixed |
| 2026-03-23 | rules.cy.ts | Carga / lectura | Spinner bloqueaba título; race al ampliar tipos tx `sale`→`sale,rule` | loyaleasy-frontend | Rules.tsx sin gate; DEFAULT_TRANSACTION_TYPES; deploy SPA | fixed |
| 2026-03-23 | rules.cy.ts | crea / edita regla | Toast lento vs PUT Simulith | e2e-test | Esperar PUT 204 + assert DOM | fixed |
| 2026-03-23 | rules.cy.ts | Suite completa | — | — | 11/11 pass tras seed + deploy + fixes | pass |
| 2026-03-23 | program-administration.cy.ts | Datos MSW | Spec usaba `Aliado Demo` / `tenant-1`; seed tiene Comfama/Deelite/Frisby | e2e-test | Fixture `simulith-program-admin.json` + helpers; MSW-only en `describeWhenMsw` | fixed |
| 2026-03-23 | program-administration.cy.ts | Suite Simulith | — | — | 18 pass, 7 pending (mutaciones/paginación MSW) | pass |
| 2026-03-23 | program-administration.cy.ts | 7 pending MSW | Seed 1 oficina Comfama; spec IDs MSW; mutaciones sin aislamiento | loyaleasy-seed + e2e-test | Seed 11 oficinas + desactivada; `describeWhenSimulith`; helpers disposable | fixed |
| 2026-03-23 | program-administration.cy.ts | Paso 3b mutaciones | — | — | 25 Simulith activos; corrida estable 24/25 (login Cognito flaky) | pass |
| 2026-09-23 | program-administration.cy.ts | Mutaciones Simulith (5 fail) | Admin creado (POST 200) pero email no en tabla; oficinas timeout toast 15s | e2e-test | Paginación: `filterAdminsByEmail` + `wait @listTenantAdmins`; oficinas: `cy.wait` POST/PUT 30s | fixed |
| 2026-09-23 | program-administration.cy.ts | Suite Simulith | — | — | 25/25 pass, 7 pending MSW (~10m) | pass |
| 2026-03-23 | accumulation.cy.ts | Botón disabled | OfficeContext sin oficina cargada | e2e-test | `waitForAccumulationReady()` | fixed |
| 2026-03-23 | accumulation.cy.ts | Doc / valor | `12345678` + $100 → 0 pts (conversionValue 1000) | loyaleasy-seed + e2e-test | Doc `10000003`, valor `5000` en fixture | fixed |
| 2026-03-23 | accumulation.cy.ts | POST /income | 502 `lambda function error` | loyaleasy-backend | `logger.info` post-reglas contaminaba respuesta Simulith; quitar log en `income/service.js` | fixed |
| 2026-09-23 | accumulation.cy.ts | Suite Simulith | — | — | 4/4 pass (~1m30s) | pass |
| 2026-09-23 | redemption.cy.ts | Doc / OTP MSW | Spec hardcodeaba `12345678` + OTP fijo `123456` | e2e-test | Fixture `10000003`; OTP real vía `cy.task(getSimulithOtp)` | fixed |
| 2026-09-23 | redemption.cy.ts | Rate limit OTP | Segundo POST /otp → 429 entre tests | e2e-test | `deleteSimulithOtp` en `beforeEach` | fixed |
| 2026-09-23 | redemption.cy.ts | Suite Simulith | — | — | 5/5 pass (~2m) | pass |
| 2026-09-23 | transaction-history.cy.ts | Doc / fechas MSW | `3001234567`, `2023-10-*`, `Oficina Principal` | e2e-test | Doc `10000003`, rango dinámico 1 año, `Comfama Centro` | fixed |
| 2026-09-23 | transaction-history.cy.ts | Badge Vencido | Sin tx `expiration` en RDS Simulith | e2e-test | Test en `describeWhenMsw` (MSW sintético) | fixed |
| 2026-09-23 | transaction-history.cy.ts | Suite Simulith | — | — | 9/9 activos, 1 pending MSW (~2m) | pass |
| 2026-09-23 | user.cy.ts | Puntos / historial MSW | Valores fijos `1.500`/`400`, `Oficina Principal` | e2e-test | Puntos reales + rango dinámico + `Comfama Centro` | fixed |
| 2026-09-23 | user.cy.ts | Carga puntos async | Assert antes de `.text-3xl` | e2e-test | Timeout 20s en valor numérico | fixed |
| 2026-09-23 | user.cy.ts | Suite Simulith | — | — | 5/5 pass (~53s) | pass |

## Known gaps (antes del primer run)

| Spec | Riesgo | Notas |
| --- | --- | --- |
| `auth-flows.cy.ts` | — | Omitido en run Simulith (solo MSW) |
| `login.cy.ts` | e2e-test | MSW usa doc 8288221; Simulith usa email Cognito |
| `rules.cy.ts` | — | 11/11 pass (2026-03-23) |
| `accumulation.cy.ts` | — | 4/4 pass (2026-09-23) |
| `redemption.cy.ts` | — | 5/5 pass (2026-09-23) |
| `transaction-history.cy.ts` | — | 9/9 Simulith + 1 pending MSW (2026-09-23) |
| `program-administration.cy.ts` | — | 25/25 Simulith estable (2026-09-23; 7 pending = MSW) |
| `user.cy.ts` | — | 5/5 pass (2026-09-23) |

Actualiza esta tabla tras cada corrida.
