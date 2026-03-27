import { Button } from '@/components/ui/button';
import { getDateRangePreset, type DateRangePresetId } from '@/utils/dateRangePresets';
import { cn } from '@/lib/utils';

interface Props {
  /** Se llama con startDate/endDate ya formateados para inputs date */
  onApply: (range: { startDate: string; endDate: string }) => void;
  disabled?: boolean;
  /** Prefijo para data-testid: ej. "th" → th-preset-last7 */
  testIdPrefix: string;
  className?: string;
}

const PRESETS: { id: DateRangePresetId; label: string }[] = [
  { id: 'last7', label: 'Últimos 7 días' },
  { id: 'last30', label: 'Últimos 30 días' },
  { id: 'thisMonth', label: 'Este mes' },
];

export function DateRangePresetButtons({ onApply, disabled, testIdPrefix, className }: Props) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground whitespace-nowrap">Rango rápido:</span>
      {PRESETS.map(({ id, label }) => (
        <Button
          key={id}
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          data-testid={`${testIdPrefix}-preset-${id}`}
          onClick={() => onApply(getDateRangePreset(id))}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
