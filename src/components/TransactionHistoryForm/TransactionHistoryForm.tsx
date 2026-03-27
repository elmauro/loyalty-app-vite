import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { BACKEND_CHUNK_SIZE } from '../../constants/pagination';
import { useTransactionTypesForHistory } from '@/hooks/useTransactionTypesForHistory';
import { getTransactions, getTransactionsOptionsFromStrings } from '../../services/transactionService';
import { fetchOfficesByTenant } from '../../services/officeService';
import { toast } from 'sonner';
import { Transaction } from '../../types/Transaction';
import type { Office } from '../../types/program';
import { getErrorStatus } from '../../utils/getErrorStatus';
import { getTenantIdForRequest } from '../../utils/token';
import TransactionTableWithPagination from '../TransactionsTable/TransactionTableWithPagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { History, Search, RotateCcw } from 'lucide-react';
import { DateRangePresetButtons } from './DateRangePresetButtons';
import { cn } from '@/lib/utils';

const DEFAULT_PAGE_SIZE = 20;

/** Valor interno del Select para "Todos los tipos" (Radix no usa value vacío). */
const TRANSACTION_TYPE_ALL = '__all__';

const selectInputClass = cn(
  'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50'
);


export default function TransactionHistoryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const [total, setTotal] = useState(0);
  const [chunk, setChunk] = useState<Transaction[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [frontendPage, setFrontendPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [lastSearchParams, setLastSearchParams] = useState<{
    document: string;
    startDate: string;
    endDate: string;
    transactionType: string;
    officeId: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPagingLoading, setIsPagingLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [offices, setOffices] = useState<Office[]>([]);
  const tenantId = getTenantIdForRequest();
  const { types: transactionTypeOptions, loading: loadingTransactionTypes } =
    useTransactionTypesForHistory();
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('');

  useEffect(() => {
    if (!tenantId) return;
    let cancelled = false;
    fetchOfficesByTenant(tenantId, false)
      .then((list) => {
        if (!cancelled) setOffices(list.filter((o) => (o.isDeleted ?? 0) === 0));
      })
      .catch(() => {
        if (!cancelled) setOffices([]);
      });
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const requiredBackendPage = total > 0 ? Math.ceil(((frontendPage - 1) * pageSize + 1) / BACKEND_CHUNK_SIZE) : 0;
  const displaySlice = useMemo(() => {
    if (chunk.length === 0 || backendPage !== requiredBackendPage) return [];
    const offsetInChunk = (frontendPage - 1) * pageSize - (requiredBackendPage - 1) * BACKEND_CHUNK_SIZE;
    return chunk.slice(offsetInChunk, offsetInChunk + pageSize);
  }, [chunk, backendPage, frontendPage, pageSize, requiredBackendPage]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const documentNumber = (formData.get('documentNumber') as string) || '';
    const startDate = (formData.get('startDate') as string) || '';
    const endDate = (formData.get('endDate') as string) || '';
    const transactionType = transactionTypeFilter.trim();
    const officeId = ((formData.get('officeId') as string) || '').trim();

    if (!documentNumber) {
      toast.error('Por favor ingresa el número de documento');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await getTransactions(
        '1',
        documentNumber,
        startDate,
        endDate,
        1,
        BACKEND_CHUNK_SIZE,
        getTransactionsOptionsFromStrings(transactionType, officeId)
      );
      setTotal(res.total);
      setChunk(res.data);
      setBackendPage(1);
      setFrontendPage(1);
      setPageSize(DEFAULT_PAGE_SIZE);
      setLastSearchParams({
        document: documentNumber,
        startDate,
        endDate,
        transactionType,
        officeId,
      });
      if (res.data.length === 0) {
        toast.info('No se encontraron transacciones');
      }
    } catch (err: unknown) {
      const status = getErrorStatus(err);

      if (status === 404) {
        toast.error('Usuario no encontrado');
      } else {
        toast.error('Error al consultar transacciones');
      }
      setTotal(0);
      setChunk([]);
      setBackendPage(0);
      setLastSearchParams(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newFrontendPage: number) => {
    if (!lastSearchParams) return;
    const required = Math.ceil(((newFrontendPage - 1) * pageSize + 1) / BACKEND_CHUNK_SIZE);
    if (required !== backendPage) {
      setIsPagingLoading(true);
      getTransactions(
        '1',
        lastSearchParams.document,
        lastSearchParams.startDate,
        lastSearchParams.endDate,
        required,
        BACKEND_CHUNK_SIZE,
        getTransactionsOptionsFromStrings(
          lastSearchParams.transactionType,
          lastSearchParams.officeId
        )
      )
        .then((res) => {
          setChunk(res.data);
          setBackendPage(required);
          setFrontendPage(newFrontendPage);
        })
        .catch(() => toast.error('Error al cargar la página'))
        .finally(() => setIsPagingLoading(false));
    } else {
      setFrontendPage(newFrontendPage);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (!lastSearchParams) return;
    setPageSize(newPageSize);
    setFrontendPage(1);
    if (backendPage !== 1) {
      setIsPagingLoading(true);
      getTransactions(
        '1',
        lastSearchParams.document,
        lastSearchParams.startDate,
        lastSearchParams.endDate,
        1,
        BACKEND_CHUNK_SIZE,
        getTransactionsOptionsFromStrings(
          lastSearchParams.transactionType,
          lastSearchParams.officeId
        )
      )
        .then((res) => {
          setChunk(res.data);
          setBackendPage(1);
        })
        .catch(() => toast.error('Error al cargar'))
        .finally(() => setIsPagingLoading(false));
    }
  };

  const handleClear = () => {
    formRef.current?.reset();
    setTransactionTypeFilter('');
    setTotal(0);
    setChunk([]);
    setBackendPage(0);
    setFrontendPage(1);
    setLastSearchParams(null);
    setHasSearched(false);
  };

  const applyDatePreset = useCallback((range: { startDate: string; endDate: string }) => {
    if (startDateRef.current) startDateRef.current.value = range.startDate;
    if (endDateRef.current) endDateRef.current.value = range.endDate;
    formRef.current?.requestSubmit();
  }, []);

  return (
    <div className="form-section animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <h2 className="form-section-title">
        <History className="h-5 w-5 text-primary" />
        Historial de Transacciones
      </h2>

      <form ref={formRef} onSubmit={handleSearch} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="th-doc">Document Number</Label>
            <Input
              id="th-doc"
              name="documentNumber"
              type="text"
              inputMode="numeric"
              placeholder="Document Number"
              data-testid="th-doc"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="th-start">Fecha Inicio</Label>
            <Input
              id="th-start"
              ref={startDateRef}
              name="startDate"
              type="date"
              data-testid="th-startDate"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="th-end">Fecha Fin</Label>
            <Input
              id="th-end"
              ref={endDateRef}
              name="endDate"
              type="date"
              data-testid="th-endDate"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="th-transactionType">Tipo de transacción</Label>
            <Select
              value={transactionTypeFilter === '' ? TRANSACTION_TYPE_ALL : transactionTypeFilter}
              onValueChange={(v) => setTransactionTypeFilter(v === TRANSACTION_TYPE_ALL ? '' : v)}
              disabled={isLoading || loadingTransactionTypes}
            >
              <SelectTrigger id="th-transactionType" data-testid="th-transactionType">
                <SelectValue placeholder={loadingTransactionTypes ? 'Cargando…' : 'Tipo'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TRANSACTION_TYPE_ALL}>Todos los tipos</SelectItem>
                {transactionTypeOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {tenantId ? (
            <div className="space-y-2">
              <Label htmlFor="th-officeId">Oficina</Label>
              {offices.length > 0 ? (
                <select
                  id="th-officeId"
                  name="officeId"
                  defaultValue=""
                  data-testid="th-officeId"
                  disabled={isLoading}
                  className={selectInputClass}
                >
                  <option value="">Todas las oficinas</option>
                  {offices.map((o) => (
                    <option key={o.officeId} value={o.officeId}>
                      {o.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="th-officeId"
                  name="officeId"
                  type="text"
                  placeholder="ID oficina (opcional)"
                  autoComplete="off"
                  data-testid="th-officeId"
                  disabled={isLoading}
                />
              )}
            </div>
          ) : null}
        </div>

        <DateRangePresetButtons
          testIdPrefix="th"
          disabled={isLoading}
          onApply={applyDatePreset}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none">
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Buscar
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={handleClear}>
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </Button>
        </div>
      </form>

      {hasSearched && (
        <div className="mt-6 animate-fade-in">
          <TransactionTableWithPagination
            data={displaySlice}
            total={total}
            page={frontendPage}
            limit={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isPagingLoading}
          />
        </div>
      )}
    </div>
  );
}
