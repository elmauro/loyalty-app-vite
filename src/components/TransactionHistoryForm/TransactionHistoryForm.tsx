import { useState, useRef } from 'react';
import { getTransactions } from '../../services/transactionService';
import { toast } from 'sonner';
import { Transaction } from '../../types/Transaction';
import { getErrorStatus } from '../../utils/getErrorStatus';
import TransactionTable from '../TransactionsTable/TransactionTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { History, Search, RotateCcw } from 'lucide-react';

export default function TransactionHistoryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const documentNumber = (formData.get('documentNumber') as string) || '';
    const startDate = (formData.get('startDate') as string) || '';
    const endDate = (formData.get('endDate') as string) || '';

    if (!documentNumber) {
      toast.error('Por favor ingresa el número de documento');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const data = await getTransactions('1', documentNumber, startDate, endDate);
      setTransactions(data);
      if (data.length === 0) {
        toast.info('No se encontraron transacciones');
      }
    } catch (err: unknown) {
      const status = getErrorStatus(err);

      if (status === 404) {
        toast.error('Usuario no encontrado');
      } else {
        toast.error('Error al consultar transacciones');
      }
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    formRef.current?.reset();
    setTransactions([]);
    setHasSearched(false);
  };

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
              name="startDate"
              type="date"
              data-testid="th-startDate"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="th-end">Fecha Fin</Label>
            <Input
              id="th-end"
              name="endDate"
              type="date"
              data-testid="th-endDate"
            />
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
          <TransactionTable transactions={transactions} />
        </div>
      )}
    </div>
  );
}
