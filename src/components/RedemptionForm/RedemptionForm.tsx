import { useState, useRef } from 'react';
import { redeemPoints } from '../../services/transactionService';
import { sendOtp } from '../../services/otpService';
import { toast } from 'sonner';
import { getRedemptionErrorMessage } from '../../utils/getRedemptionErrorMessage';
import { getErrorStatus } from '../../utils/getErrorStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, RotateCcw, ShieldCheck, X } from 'lucide-react';

const DEFAULT_IDENTIFICATION_TYPE_ID = 1;

export default function RedemptionForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [documentNumber, setDocumentNumber] = useState('');
  const [identificationTypeId, setIdentificationTypeId] = useState(DEFAULT_IDENTIFICATION_TYPE_ID);
  const [points, setPoints] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpVisible, setOtpVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRedeemRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const doc = ((formData.get('documentNumber') as string) || '').trim();
    const pts = (formData.get('points') as string) || '';

    if (!doc || !pts) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setDocumentNumber(doc);
    setPoints(pts);
    setIdentificationTypeId(DEFAULT_IDENTIFICATION_TYPE_ID);

    setIsLoading(true);
    try {
      await sendOtp({ documentNumber: doc, identificationTypeId: DEFAULT_IDENTIFICATION_TYPE_ID });
      setOtpVisible(true);
      toast.success('Código OTP enviado por correo');
    } catch {
      toast.error('Error solicitando OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemConfirm = async () => {
    if (!otpCode || otpCode.length < 4) {
      toast.error('Por favor ingresa un código OTP válido');
      return;
    }
    setIsLoading(true);
    try {
      await redeemPoints({
        documentNumber,
        identificationTypeId: 1,
        otpCode,
        points: Number(points),
      });
      toast.success('Puntos redimidos');
      handleCancel();
    } catch (err: unknown) {
      const status = getErrorStatus(err);
      toast.error(status != null ? getRedemptionErrorMessage(status) : 'Error de conexión. Intenta más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setDocumentNumber('');
    setIdentificationTypeId(DEFAULT_IDENTIFICATION_TYPE_ID);
    setPoints('');
    setOtpCode('');
    setOtpVisible(false);
    formRef.current?.reset();
  };

  return (
    <div className="form-section animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <h2 className="form-section-title">
        <Gift className="h-5 w-5 text-accent" />
        Redención
      </h2>

      {!otpVisible ? (
        <form ref={formRef} onSubmit={handleRedeemRequest} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="red-document">Documento</Label>
              <Input
                id="red-document"
                name="documentNumber"
                type="text"
                inputMode="numeric"
                placeholder="Documento"
                data-testid="red-document"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="red-points">Puntos</Label>
              <Input
                id="red-points"
                name="points"
                type="number"
                inputMode="numeric"
                placeholder="Puntos"
                data-testid="red-points"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="accent" disabled={isLoading} className="flex-1 sm:flex-none">
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
                  Solicitando...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4" />
                  Redimir
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              <RotateCcw className="h-4 w-4" />
              Limpiar
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-sm text-muted-foreground mb-1">Redimiendo</p>
            <p className="font-semibold text-foreground">{points} puntos</p>
            <p className="text-sm text-muted-foreground">Documento: {documentNumber}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp-code" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Código OTP
            </Label>
            <Input
              id="otp-code"
              type="text"
              inputMode="numeric"
              placeholder="Código OTP"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
              className="text-center text-lg tracking-widest"
              data-testid="otp-code"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="success"
              onClick={handleRedeemConfirm}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-success-foreground border-t-transparent" />
                  Confirmando...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Confirmar
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
