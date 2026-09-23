import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { toast } from 'sonner';
import { DEFAULT_TRANSACTION_TYPES, fetchTransactionTypes } from '@/services/programService';
import { RulesManager } from '@/components/rules/RulesManager';

export default function Rules() {
  const [transactionTypes, setTransactionTypes] = useState<string[]>(
    DEFAULT_TRANSACTION_TYPES.income
  );
  const [selectedType, setSelectedType] = useState<string>(DEFAULT_TRANSACTION_TYPES.income[0]);

  useEffect(() => {
    let cancelled = false;
    fetchTransactionTypes()
      .then((tt) => {
        if (!cancelled && tt.income?.length) {
          setTransactionTypes(tt.income);
          setSelectedType((prev) => (tt.income.includes(prev) ? prev : tt.income[0]));
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('No se pudieron cargar los tipos de transacción');
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6">
      <RulesManager
        transactionTypes={transactionTypes}
        selectedType={selectedType}
        onSelectedTypeChange={setSelectedType}
        renderHeader={({ onCreate, saving }) => (
          <div>
            <Link
              to={paths.administration}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block mb-2"
            >
              ← Administración
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Reglas de Bonificación</h1>
                  <p className="text-muted-foreground">Gestión de reglas del programa de puntos</p>
                </div>
              </div>
              <Button onClick={onCreate} disabled={saving} data-testid="rules-new-rule">
                {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />}
                Nueva regla
              </Button>
            </div>
          </div>
        )}
      />
    </div>
  );
}
