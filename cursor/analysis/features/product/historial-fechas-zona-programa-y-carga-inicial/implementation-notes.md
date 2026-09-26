# Implementation notes

## Backend (loyalty-program-serverless)

Paquete de feature y deploy de layer:  
`loyalty-program-serverless/cursor/analysis/features/backend/historial-fechas-zona-programa-y-carga-inicial/implementation-notes.md`

## Frontend (loyalty-app-vite)

- `getDefaultHistoryDateRange()` / `HISTORY_EMPTY_RANGE_HINT`
- Mi Cuenta: `useEffect` carga historial últimos 30 días
- Admin historial: inputs pre-rellenados al montar

## Deploy local Simulith

```bash
cd layer-transversal && npm install && npm run build:win   # o build
# redeploy transaction-api history (deploy-backend)
```
