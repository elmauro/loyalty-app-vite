import { useState, useRef } from 'react';
import { accumulatePoints } from '../../services/transactionService';
import { toast } from 'sonner';
import { getAccumulationErrorMessage } from '../../utils/getAccumulationErrorMessage';
import { getErrorStatus } from '../../utils/getErrorStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, RotateCcw } from 'lucide-react';

export default function AccumulationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccumulate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const phoneNumber = (formData.get('phoneNumber') as string) || '';
    const value = (formData.get('value') as string) || '';

    if (!phoneNumber || !value) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    setIsLoading(true);
    try {
      await accumulatePoints({
        phoneNumber,
        identificationTypeId: 1,
        value: Number(value),
      });
      toast.success('Puntos acumulados');
      formRef.current?.reset();
    } catch (err: unknown) {
      const status = getErrorStatus(err);
      toast.error(status != null ? getAccumulationErrorMessage(status) : 'Error de conexión. Intenta más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    formRef.current?.reset();
  };

  return (
    <div className="form-section animate-slide-up">
      <h2 className="form-section-title">
        <Plus className="h-5 w-5 text-primary" />
        Acumulación
      </h2>

      <form ref={formRef} onSubmit={handleAccumulate} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="acc-phone">Phone Number</Label>
            <Input
              id="acc-phone"
              name="phoneNumber"
              type="tel"
              inputMode="numeric"
              placeholder="Phone Number"
              data-testid="acc-phone"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acc-value">Valor $</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="acc-value"
                name="value"
                type="number"
                inputMode="numeric"
                placeholder="Valor $"
                className="pl-7"
                data-testid="acc-value"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none">
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Acumulando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Acumular
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={handleClear}>
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </Button>
        </div>
      </form>
    </div>
  );
}
