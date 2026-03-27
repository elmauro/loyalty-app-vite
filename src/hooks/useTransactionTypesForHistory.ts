import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  fetchTransactionTypes,
  mergeTransactionTypesForHistory,
  DEFAULT_TRANSACTION_TYPES,
} from '@/services/programService';

/**
 * Tipos del programa para el filtro de historial (admin): mismo endpoint que Acumulación,
 * uniendo income + expense vía `mergeTransactionTypesForHistory`.
 */
export function useTransactionTypesForHistory() {
  const [types, setTypes] = useState<string[]>(() =>
    mergeTransactionTypesForHistory(DEFAULT_TRANSACTION_TYPES)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTransactionTypes()
      .then((tt) => {
        if (!cancelled) {
          const merged = mergeTransactionTypesForHistory(tt);
          if (merged.length) setTypes(merged);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('No se pudieron cargar los tipos de transacción');
          setTypes(mergeTransactionTypesForHistory(DEFAULT_TRANSACTION_TYPES));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { types, loading };
}
