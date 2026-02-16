# Alineación E2E ↔ Backend (Swagger)

Este documento relaciona las pruebas E2E de Cypress con la documentación Swagger del backend y los servicios del frontend, para comprobar que las pruebas responden adecuadamente a los cambios del backend.

## Cómo se ejecutan las E2E hoy

- **Por defecto**, las E2E usan **MSW (mocks)**:
  - El script `cy:e2e` arranca la app con `VITE_USE_MSW=true`, por lo que todas las llamadas API son interceptadas por MSW.
  - Las pruebas **no llaman al backend real**; validan flujos de la UI contra respuestas mock.
- Para **validar contra el backend real** después de cambios en el servidor, hay que ejecutar las E2E **sin MSW** y con las URLs del backend configuradas (ver más abajo).

---

## Mapa: E2E → API (Swagger)

### 1. Login (`login.cy.ts`)

| E2E escenario | Endpoint | Swagger |
|---------------|----------|---------|
| Formulario de login, validación vacía, login admin (8288221/8221), login usuario (55555555/5555), navegación registro/forgot password, mostrar/ocultar contraseña | `POST /api/authentications` | `auth-api/docs/swagger.yaml` |

**Contrato (Swagger):**
- **Request:** `login`, `pass`, `loginTypeId`, `identificationTypeId` (headers: `x-program-id`, `x-api-key`).
- **Responses:** 200 (token, firstname, iscustomer, roles, etc.), 400, 403, 404.

**Frontend:** `authService.login()` envía `loginTypeId: 1`, `identificationTypeId: 1`, `login`, `pass`. **Alineado.**

**Mocks (MSW):** `authHandlers.ts` devuelve success para `8288221/8221` (admin) y `55555555/5555` (user). La respuesta es mínima (`firstname`, `oauthid`, `token`); el frontend construye el usuario desde el JWT (`buildUserFromToken`).

---

### 2. Acumulación (`accumulation.cy.ts`)

| E2E escenario | Endpoint | Swagger |
|---------------|----------|---------|
| Envío correcto (teléfono + valor), campos vacíos, 401 redirige a login, limpiar formulario | `POST /income53rv1c3/income` | `transaction-api/docs/income/swagger.yaml` |

**Contrato (Swagger):**
- **Request body:** `phoneNumber`, `value`, `identificationTypeId`. Headers: `x-access-token`, `x-program-id`, `x-tenant-code`, `x-transaction-type` (ej. `sale`).
- **Responses:** 200 `{ status: "processed" }`, 400, 401, 403, 404, 429.

**Frontend:** `transactionService.accumulatePoints()` envía `phoneNumber` (con código de país), `value`, `identificationTypeId: 1` y los headers indicados. **Alineado.**

**Mocks:** `transactionHandlers` devuelve 200 con `{ status: "processed" }` (o objeto con `type`/`status`). La UI solo necesita éxito para mostrar "Puntos acumulados". **Alineado.**

---

### 3. Redención (`redemption.cy.ts`)

| E2E escenario | Endpoint | Swagger |
|---------------|----------|---------|
| Solicitar OTP → campo OTP visible; completar con OTP 123456; campos vacíos; 401; cancelar después de OTP | 1) `POST /otp53rv1c3-1` (OTP) 2) `POST /expense53rv1c3/expense` (redimir) | OTP: no documentado en auth-api Swagger. Expense: `transaction-api/docs/expense/swagger.yaml` |

**Contrato Expense (Swagger):**
- **Request body:** `phoneNumber`, `points`, `otpCode`, `identificationTypeId`. Mismos headers que income (incl. `x-transaction-type`: `redemption`).
- **Responses:** 200 `{ status: "processed" }`, 400, 401, 403, 404, **409** (insufficient points / OTP already used), 429.

**Frontend:** `otpService.sendOtp()` → auth base; `transactionService.redeemPoints()` con `phoneNumber`, `points`, `otpCode`, `identificationTypeId`. **Alineado con expense.**

**Swagger OTP:** `otp-api/docs/swagger.yaml` — Request: `phoneNumber`. Responses: 200 (éxito, sin OTP en cuerpo en producción), 400 (code, error), 429 (rate limit).

**Mocks:** OTP devuelve `{ type: 'success', otp: '...' }`; expense devuelve success. E2E usan OTP `123456` y esperan "Puntos redimidos". **Alineado con mocks actuales.**

---

### 4. Historial de transacciones (`transaction-history.cy.ts`)

| E2E escenario | Endpoint | Swagger |
|---------------|----------|---------|
| Consulta con doc + fechas, paginación (tamaño 10/20/50), anterior/siguiente, documento vacío, 401, limpiar | `GET /history53rv1c3/history/{docType}/{documentNumber}` | `transaction-api/docs/history/swagger.yml` |

**Contrato (Swagger):**
- **Path:** `docType` (number), `documentNumber` (number). **Query:** `startDate`, `endDate`, `page`, `limit` (enum 10, 20, 50, 100; default 100).
- **Response 200:** `{ data: Transaction[], total, page, limit }`.

**Frontend:** `getTransactions(typeId, document, startDate, endDate, page, limit)` con `typeId = '1'` y `document` string. La URL es `/history53rv1c3/history/${typeId}/${document}`. En la práctica muchos backends aceptan números en path como string; si el backend exige **solo número**, habría que asegurar que `document` sea numérico o que el servidor acepte string.

**Mocks:** Devuelven `{ data, total, page, limit }` y expanden a 25 ítems para probar paginación (p. ej. "Página 1 de 3" con 10 por página). **Alineado.**

---

### 5. Usuario (`user.cy.ts`)

| E2E escenario | Endpoint | Swagger |
|---------------|----------|---------|
| Dashboard usuario, consulta transacciones (fechas), logout | Mismo `GET /history53rv1c3/history/...` que arriba | Mismo `history/swagger.yml` |

Mismo contrato y mismas consideraciones que en el historial de transacciones.

---

### 6. Reglas (`rules` – engine-api)

| Funcionalidad | Endpoint | Documentación |
|---------------|----------|---------------|
| Obtener reglas | `GET /rulesGet53rv1c3/engines/jsonrule` | `engine-api/docs/ENGINE-API-POSTMAN.md` |
| Guardar reglas | `PUT /rulesPut53rv1c3/engines/jsonrule` | Idem |
| Ejecutar reglas (simulador) | `POST /rulesPost53rv1c3/engines/jsonrule` | Idem |

**Contrato:**
- **Headers:** `x-access-token`, `x-program-id`, `x-transaction-type`, `x-tenant-id` (opcional).
- **GET response:** plain JSON `{ attributes, decisions }` según json-rules-engine.
- **PUT body:** mismo formato. La API usa DocumentClient; no hay formato DynamoDB en la capa REST.

**Frontend:** `rulesService.getRules()` y `rulesService.updateRules()` con paths `rulesGet53rv1c3` y `rulesPut53rv1c3`. **Alineado.**

**Nota:** No hay E2E de Cypress para Rules actualmente. Al añadirlas, usar los mismos headers y formato que el resto de la app.

---

## Resumen de alineación

| Área | Swagger | Frontend (servicios) | Mocks (MSW) | Notas |
|------|---------|----------------------|-------------|--------|
| Auth (login) | ✅ | ✅ | ✅ | Request/response alineados. |
| Income (acumulación) | ✅ | ✅ | ✅ | 200 con `status`. |
| Expense (redención) | ✅ | ✅ | ✅ | Incluye 409 en Swagger; frontend puede mostrar error genérico por status. |
| History | ✅ | ✅ | ✅ | Path: Swagger usa `docType`/`documentNumber` (number); frontend envía string; revisar si el backend acepta string. |
| Points | ✅ | ✅ | ✅ | Mismo comentario sobre tipo en path si aplica. |
| OTP | ✅ `otp-api/docs/swagger.yaml` | ✅ | ✅ | Mocks alineados con 200/400/429. |
| Rules (engine-api) | ENGINE-API-POSTMAN.md | ✅ | — | GET/PUT plain JSON; sin E2E aún. |

---

## Cómo validar E2E contra el backend real

Tras cambios en el backend, puedes comprobar que las E2E responden bien contra la API real:

1. **Configurar `.env`** (o variables de entorno) con las URLs del backend:
   - `VITE_API_BASE_AUTH=...`
   - `VITE_API_BASE_APP=...`
   - `VITE_API_KEY=...` (y opcionalmente `VITE_PROGRAM_ID`, etc.)

2. **No activar MSW:** ejecutar la app **sin** `VITE_USE_MSW=true`.

3. **Scripts añadidos** en `package.json`:
   - `cy:dev:real`: arranca Vite **sin** MSW (usa backend real).
   - `cy:e2e:real`: abre Cypress con app contra backend real.
   - `cy:e2e:run:real`: ejecuta Cypress en modo headless contra backend real.

4. Ejecutar:
   ```bash
   npm run cy:e2e:real
   ```
   o, para solo ejecución headless:
   ```bash
   npm run cy:e2e:run:real
   ```

**Requisitos:** Backend desplegado y accesible; usuarios de prueba (ej. 8288221/8221, 55555555/5555) existan y se comporten como esperan las E2E (roles, tenants, datos de historial, etc.). Si el backend no tiene esos usuarios o datos, algunas pruebas fallarán; en ese caso se pueden mantener las E2E con MSW para regresión de UI y usar `cy:e2e:real` solo para validación puntual contra el backend.

---

## Recomendaciones

1. **Ejecutar E2E contra backend real** después de cambios relevantes en el backend (auth, income, expense, history, OTP), usando `cy:e2e:run:real` y las variables de entorno adecuadas.
2. **Documentar el endpoint OTP** en Swagger (auth-api o el módulo que corresponda) para mantener un único contrato.
3. **Revisar tipos de path** en history/points (`docType`, `documentNumber`): si el backend solo acepta número, ajustar frontend o documentar que acepta string.
4. **Mantener los mocks** alineados con los esquemas y códigos de estado de Swagger (incl. 409 y 429 en expense) para que las E2E con MSW sigan siendo útiles cuando no se use el backend real.
