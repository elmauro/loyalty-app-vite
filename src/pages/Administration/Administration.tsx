import AccumulationForm from '../../components/AccumulationForm/AccumulationForm';
import RedemptionForm from '../../components/RedemptionForm/RedemptionForm';
import TransactionHistory from '../../components/TransactionHistoryForm/TransactionHistoryForm';
import { Shield } from 'lucide-react';

export default function Administration() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administración</h1>
          <p className="text-muted-foreground">Gestiona puntos y consulta transacciones</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AccumulationForm />
        <RedemptionForm />
      </div>

      <TransactionHistory />
    </div>
  );
}
