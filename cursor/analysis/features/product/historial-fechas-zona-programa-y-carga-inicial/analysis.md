# Analysis — Historial fechas

## Problema

- Puntos consultan `incomes` sin filtro de fecha.
- Historial filtra `created_at` con rango derivado de `moment()` UTC y fin de día sin zona programa.
- UI enviaba fechas vacías o días locales; desfase UTC vs Colombia excluía filas recientes.

## Decisión

- Módulo `historyDateRange.js`: días calendario en `America/Bogota` (`PROGRAM_TIMEZONE`), comparación SQL en UTC.
- Default sin fechas: 30 días (preset UI).
- Frontend: carga inicial en Mi Cuenta + defaults en admin + hint vacío.

## Evidencia

- `transaction-api/services/history/database.js` (antes)
- `User.tsx`, `dateRangePresets.ts`
