# User Story — Historial: fechas zona programa y carga inicial

- Name: Historial: fechas zona programa y carga inicial
- Ticket/story: n/a

## Como

cliente o administrador de Loyaleasy,

## Quiero

ver transacciones en el historial con el mismo criterio de fechas que uso en la interfaz (Colombia),

## Para

no ver puntos disponibles pero un historial vacío el mismo día de una acumulación.

## Criterios de aceptación

1. **HIS-07/HIS-08 (backend):** `startDate`/`endDate` en query son días inclusivos en `America/Bogota`; default API = últimos 30 días en esa zona.
2. **Mi Cuenta:** al entrar, se rellenan fechas (últimos 30 días) y se consulta historial automáticamente.
3. **Administración — historial:** fechas por defecto pre-rellenadas (últimos 30 días); búsqueda manual sigue igual.
4. **Vacío:** mensaje que sugiera ampliar el rango de fechas.
5. Contrato documentado en Swagger y REGLAS-NEGOCIO; tests de dominio en verde.

## Alcance

- **Este repo:** UI `User.tsx`, `TransactionHistoryForm`, tablas, presets.
- **Backend (otro repo):** `loyalty-program-serverless/cursor/analysis/features/backend/historial-fechas-zona-programa-y-carga-inicial/` — `transaction-api`, **layer-transversal**, Swagger, REGLAS-NEGOCIO.
- Fuera de alcance: timezone por programa en Dynamo (fase posterior).
