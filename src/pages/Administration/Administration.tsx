import { Link } from 'react-router-dom';
import AccumulationForm from '../../components/AccumulationForm/AccumulationForm';
import RedemptionForm from '../../components/RedemptionForm/RedemptionForm';
import TransactionHistory from '../../components/TransactionHistoryForm/TransactionHistoryForm';
import { Shield, BookOpen, MapPin, Loader2 } from 'lucide-react';
import { paths } from '../../routes/paths';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OfficeProvider, useOfficeContext } from '@/contexts/OfficeContext';
import { getTenantForRequest } from '@/utils/token';

function AdministrationContent() {
  const { selectedOffice, offices, isLoading, hasOffices, setSelectedOffice } = useOfficeContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Administración</h1>
            <p className="text-muted-foreground">Gestiona puntos y consulta transacciones</p>
          </div>
        </div>
        <Link to={paths.rules}>
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Reglas de bonificación
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Oficina</span>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Cargando oficinas...</span>
          </div>
        ) : !hasOffices ? (
          <p className="text-sm text-amber-600 dark:text-amber-500">
            Se debe crear una oficina para realizar acumulación y redención.
          </p>
        ) : (
          <Select
            value={selectedOffice?.officeId ?? ''}
            onValueChange={(id) => {
              const office = offices.find((o) => o.officeId === id) ?? null;
              setSelectedOffice(office);
            }}
          >
            <SelectTrigger className="w-full sm:w-[280px]" data-testid="admin-office-select">
              <SelectValue placeholder="Seleccionar oficina" />
            </SelectTrigger>
            <SelectContent>
              {offices.map((o) => (
                <SelectItem key={o.officeId} value={o.officeId}>
                  {o.name}
                  {(o.isDefault ?? 0) === 1 ? ' (por defecto)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AccumulationForm />
        <RedemptionForm />
      </div>

      <TransactionHistory />
    </div>
  );
}

export default function Administration() {
  const tenant = getTenantForRequest();
  if (!tenant?.tenantId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Administración</h1>
        <p className="text-muted-foreground">No hay tenant configurado.</p>
      </div>
    );
  }

  return (
    <OfficeProvider>
      <AdministrationContent />
    </OfficeProvider>
  );
}
