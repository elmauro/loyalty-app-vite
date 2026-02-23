import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp, confirmSignUp, isCognitoEnabled } from '@/services/cognitoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Award, ArrowLeft, Eye, EyeOff, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function Registration() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [formData, setFormData] = useState({
    givenName: '',
    familyName: '',
    phoneNumber: '',
    birthDate: '',
    documentNumber: '',
    email: '',
    password: '',
    acceptTerms: false,
  });
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const givenTrimmed = formData.givenName?.trim() ?? '';
    const familyTrimmed = formData.familyName?.trim() ?? '';
    if (!givenTrimmed) {
      newErrors.givenName = 'El nombre es requerido';
    }
    if (!familyTrimmed) {
      newErrors.familyName = 'Los apellidos son requeridos';
    }
    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      newErrors.phoneNumber = 'Ingresa un número de teléfono válido';
    }
    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es requerida';
    }
    const docTrimmed = formData.documentNumber?.trim() ?? '';
    if (!docTrimmed) {
      newErrors.documentNumber = 'El número de documento es requerido';
    }
    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Ingresa un email válido';
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrige los errores del formulario');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (isCognitoEnabled()) {
        await signUp({
          email: formData.email,
          password: formData.password,
          givenName: formData.givenName?.trim() || undefined,
          familyName: formData.familyName?.trim() || undefined,
          phoneNumber: formData.phoneNumber || undefined,
          identTypeId: '1',
          docNumber: formData.documentNumber,
          programId: undefined,
          isCustomer: '1',
          termsaccepted: formData.acceptTerms ? '1' : '0',
          roles: '2',
        });
        setStep('confirm');
        toast.success('Código enviado a tu email. Verifica tu bandeja de entrada.');
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success('Registro enviado. Ahora puedes iniciar sesión.');
        navigate('/login');
      }
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || '';
      const genericError = 'No se pudo completar el registro. Verifica los datos e intenta de nuevo.';
      const validationError = 'Verifica que todos los campos requeridos estén completos.';
      if (message.includes('VALIDATION_ERROR') || message.includes('DOCUMENT_REQUIRED')) {
        setErrors({ documentNumber: validationError });
        toast.error(validationError);
      } else if (
        message.includes('UsernameExistsException') ||
        message.includes('REGISTRATION_FAILED') ||
        message.includes('DOCUMENT_ALREADY_REGISTERED') ||
        message.includes('PHONE_ALREADY_REGISTERED') ||
        message.includes('already exists')
      ) {
        setErrors({});
        toast.error(genericError);
      } else if (message.toLowerCase().includes('phone') || message.toLowerCase().includes('teléfono')) {
        setErrors({ phoneNumber: genericError });
        toast.error(genericError);
      } else {
        setErrors({});
        toast.error(genericError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationCode.trim()) {
      toast.error('Ingresa el código de verificación');
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      await confirmSignUp(formData.email, confirmationCode.trim());
      toast.success('Cuenta registrada. Ya puedes iniciar sesión.');
      navigate('/login');
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || '';
      setErrors({ confirmationCode: message || 'Código inválido. Intenta de nuevo.' });
      toast.error(message || 'Código inválido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex lg:flex-1 hero-gradient relative items-center justify-center">
        <div className="text-center text-primary-foreground p-12">
          <Award className="h-24 w-24 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Únete ahora</h2>
          <p className="text-primary-foreground/80 max-w-md">
            Crea tu cuenta y comienza a acumular puntos con cada compra. ¡Es rápido y fácil!
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Award className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">Loyalty Platform</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Sign Up</h1>
            <p className="mt-2 text-muted-foreground">Crea tu cuenta para comenzar</p>
          </div>

          {step === 'confirm' ? (
            <form onSubmit={handleConfirmCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de verificación</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  placeholder="Código de 6 dígitos"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  maxLength={6}
                  className={errors.confirmationCode ? 'border-destructive' : ''}
                />
                {errors.confirmationCode && (
                  <p className="text-xs text-destructive">{errors.confirmationCode}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Revisa tu email ({formData.email}) para el código.
                </p>
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Verificando...
                  </>
                ) : (
                  'Confirmar cuenta'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('form')}
              >
                Volver al formulario
              </Button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="givenName">Nombre</Label>
              <Input
                id="givenName"
                type="text"
                placeholder="Tu nombre"
                value={formData.givenName}
                onChange={(e) => setFormData({ ...formData, givenName: e.target.value })}
                className={errors.givenName ? 'border-destructive' : ''}
              />
              {errors.givenName && <p className="text-xs text-destructive">{errors.givenName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyName">Apellidos</Label>
              <Input
                id="familyName"
                type="text"
                placeholder="Tus apellidos"
                value={formData.familyName}
                onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                className={errors.familyName ? 'border-destructive' : ''}
              />
              {errors.familyName && <p className="text-xs text-destructive">{errors.familyName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Teléfono</Label>
              <Input
                id="phoneNumber"
                type="tel"
                inputMode="numeric"
                placeholder="3001234567"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={errors.phoneNumber ? 'border-destructive' : ''}
              />
              {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <div className="relative">
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className={errors.birthDate ? 'border-destructive' : ''}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentNumber">Document Number</Label>
              <Input
                id="documentNumber"
                type="text"
                inputMode="numeric"
                placeholder="Número de documento"
                value={formData.documentNumber}
                onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                className={errors.documentNumber ? 'border-destructive' : ''}
              />
              {errors.documentNumber && <p className="text-xs text-destructive">{errors.documentNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked === true })}
                  className={errors.acceptTerms ? 'border-destructive' : ''}
                />
                <Label htmlFor="terms" className="text-sm font-normal leading-tight cursor-pointer">
                  I accept the <a href="#" className="text-primary hover:underline">Terms and Conditions</a>
                </Label>
              </div>
              {errors.acceptTerms && <p className="text-xs text-destructive">{errors.acceptTerms}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </Button>
          </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
