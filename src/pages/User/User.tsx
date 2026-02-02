import { useState, useRef, useMemo } from 'react';
import { BACKEND_CHUNK_SIZE } from '../../constants/pagination';
import { getTransactions } from '../../services/transactionService';
import { useAuth } from '../../store/AuthContext';
import TransactionTableWithPagination from '../../components/TransactionsTable/TransactionTableWithPagination';
import { toast } from 'sonner';
import { Transaction } from '../../types/Transaction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as UserIcon, Search, RotateCcw, Calendar } from 'lucide-react';

const DEFAULT_PAGE_SIZE = 20;

export default function UserPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const { state } = useAuth();
  const [total, setTotal] = useState(0);
  const [chunk, setChunk] = useState<Transaction[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [frontendPage, setFrontendPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [lastSearchParams, setLastSearchParams] = useState<{ startDate: string; endDate: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPagingLoading, setIsPagingLoading] = useState(false);

  const user = state.user;
  const phoneNumber = user?.identification ?? '';

  const totalFrontendPages = Math.max(1, Math.ceil(total / pageSize));
  const requiredBackendPage = total > 0 ? Math.ceil(((frontendPage - 1) * pageSize + 1) / BACKEND_CHUNK_SIZE) : 0;
  const displaySlice = useMemo(() => {
    if (chunk.length === 0 || backendPage !== requiredBackendPage) return [];
    const offsetInChunk = (frontendPage - 1) * pageSize - (requiredBackendPage - 1) * BACKEND_CHUNK_SIZE;
    return chunk.slice(offsetInChunk, offsetInChunk + pageSize);
  }, [chunk, backendPage, frontendPage, pageSize, requiredBackendPage]);

  const handleFind = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startDate = (formData.get('startDate') as string) || '';
    const endDate = (formData.get('endDate') as string) || '';

    try {
      setIsLoading(true);
      const res = await getTransactions('1', phoneNumber, startDate, endDate, 1, BACKEND_CHUNK_SIZE);
      setTotal(res.total);
      setChunk(res.data);
      setBackendPage(1);
      setFrontendPage(1);
      setPageSize(DEFAULT_PAGE_SIZE);
      setLastSearchParams({ startDate, endDate });
      toast.success('Transacciones cargadas');
    } catch {
      toast.error('Error al consultar transacciones');
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
        phoneNumber,
        lastSearchParams.startDate,
        lastSearchParams.endDate,
        required,
        BACKEND_CHUNK_SIZE
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
        phoneNumber,
        lastSearchParams.startDate,
        lastSearchParams.endDate,
        1,
        BACKEND_CHUNK_SIZE
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
    setTotal(0);
    setChunk([]);
    setBackendPage(0);
    setFrontendPage(1);
    setLastSearchParams(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <UserIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Cuenta</h1>
          <p className="text-muted-foreground">Consulta tu historial de transacciones</p>
        </div>
      </div>

      <div className="form-section animate-slide-up">
        <h2 className="form-section-title">
          <Search className="h-5 w-5 text-primary" />
          Historial de Transacciones
        </h2>
        <form ref={formRef} onSubmit={handleFind} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha inicio</Label>
              <div className="relative">
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  data-testid="user-startDate"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha fin</Label>
              <div className="relative">
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  data-testid="user-endDate"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
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
                  Find
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleClear}>
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </form>

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
      </div>
    </div>
  );
}
