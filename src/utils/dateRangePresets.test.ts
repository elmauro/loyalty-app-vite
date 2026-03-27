import { formatDateInputLocal, getDateRangePreset } from './dateRangePresets';

describe('dateRangePresets', () => {
  it('getDateRangePreset last7 ends today and starts 7 days before', () => {
    const { startDate, endDate } = getDateRangePreset('last7');
    expect(endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(startDate <= endDate).toBe(true);
  });

  it('getDateRangePreset thisMonth starts on day 1 of current month', () => {
    const { startDate, endDate } = getDateRangePreset('thisMonth');
    const today = new Date();
    const expectedStart = formatDateInputLocal(new Date(today.getFullYear(), today.getMonth(), 1));
    expect(startDate).toBe(expectedStart);
    expect(endDate).toBe(formatDateInputLocal(new Date(today.getFullYear(), today.getMonth(), today.getDate())));
  });
});
