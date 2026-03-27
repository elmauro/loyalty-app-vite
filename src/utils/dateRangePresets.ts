/** Fecha local en formato YYYY-MM-DD para inputs type="date" */
export function formatDateInputLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type DateRangePresetId = 'last7' | 'last30' | 'thisMonth';

/**
 * Rangos rápidos (fecha fin = hoy local; inicio según preset).
 */
export function getDateRangePreset(preset: DateRangePresetId): { startDate: string; endDate: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = formatDateInputLocal(today);

  const start = new Date(today);
  if (preset === 'last7') {
    start.setDate(start.getDate() - 7);
  } else if (preset === 'last30') {
    start.setDate(start.getDate() - 30);
  } else {
    start.setDate(1);
    start.setMonth(today.getMonth());
    start.setFullYear(today.getFullYear());
  }

  return { startDate: formatDateInputLocal(start), endDate };
}
