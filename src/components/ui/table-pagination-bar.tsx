import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Misma escala que Historial de Transacciones */
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export interface TablePaginationBarProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
  /** Evita ids duplicados si hay varias barras en la misma vista */
  idPrefix?: string;
}

export function TablePaginationBar({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  idPrefix = 'table-pg',
}: TablePaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = total === 0 ? 0 : Math.min(page * pageSize, total);
  const selectId = `${idPrefix}-page-size`;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <label htmlFor={selectId} className="text-sm text-muted-foreground whitespace-nowrap">
          Mostrar
        </label>
        <select
          id={selectId}
          value={pageSize}
          onChange={(e) =>
            onPageSizeChange(Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])
          }
          disabled={isLoading}
          className={cn(
            'h-10 rounded-md border border-input bg-background px-3 py-2 text-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          aria-label="Cantidad por página"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {startIndex}-{endIndex} de {total}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Página {page} de {totalPages}
        </span>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
