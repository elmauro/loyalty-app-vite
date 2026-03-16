import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Office } from '@/types/program';
import { fetchOfficesByTenant, fetchOfficeDefaultByTenant } from '@/services/officeService';
import { getTenantIdForRequest } from '@/utils/token';

interface OfficeContextValue {
  /** Oficina actualmente seleccionada para transacciones. */
  selectedOffice: Office | null;
  /** Lista de oficinas activas del tenant. */
  offices: Office[];
  /** true mientras se cargan oficinas. */
  isLoading: boolean;
  /** true si hay al menos una oficina activa. */
  hasOffices: boolean;
  /** Cambia la oficina seleccionada. */
  setSelectedOffice: (office: Office | null) => void;
  /** Recarga oficinas (ej. tras crear/editar en otro lugar). */
  refreshOffices: () => Promise<void>;
}

const OfficeContext = createContext<OfficeContextValue | undefined>(undefined);

interface OfficeProviderProps {
  children: React.ReactNode;
  /** Si no se pasa, usa tenantId del JWT. */
  tenantId?: string;
}

export function OfficeProvider({ children, tenantId: tenantIdProp }: OfficeProviderProps) {
  const tenantId = tenantIdProp ?? getTenantIdForRequest();
  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOffices = useCallback(async () => {
    if (!tenantId) {
      setOffices([]);
      setSelectedOffice(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [list, defaultOffice] = await Promise.all([
        fetchOfficesByTenant(tenantId, false),
        fetchOfficeDefaultByTenant(tenantId),
      ]);
      const active = list.filter((o) => (o.isDeleted ?? 0) === 0);
      setOffices(active);

      if (active.length === 0) {
        setSelectedOffice(null);
      } else if (defaultOffice && active.some((o) => o.officeId === defaultOffice.officeId)) {
        setSelectedOffice(defaultOffice);
      } else {
        setSelectedOffice(active[0]);
      }
    } catch {
      setOffices([]);
      setSelectedOffice(null);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadOffices();
  }, [loadOffices]);

  const refreshOffices = useCallback(async () => {
    await loadOffices();
  }, [loadOffices]);

  const value: OfficeContextValue = {
    selectedOffice,
    offices,
    isLoading,
    hasOffices: offices.length > 0,
    setSelectedOffice,
    refreshOffices,
  };

  return (
    <OfficeContext.Provider value={value}>
      {children}
    </OfficeContext.Provider>
  );
}

export function useOfficeContext() {
  const context = useContext(OfficeContext);
  if (!context) {
    throw new Error('useOfficeContext must be used within an OfficeProvider');
  }
  return context;
}
