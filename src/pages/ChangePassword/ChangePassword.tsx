import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { changePassword, isCognitoEnabled } from '@/services/cognitoService';
import { getEmailFromAuth } from '@/utils/token';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Award, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { paths } from '@/routes/paths';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const email = getEmailFromAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Completa todos los campos');
      return;
    }
    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!isCognitoEnabled()) {
      setError('El cambio de contraseña solo está disponible para cuentas con email.');
      return;
    }

    if (!email) {
      setError('No se pudo obtener tu email. Inicia sesión de nuevo.');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(email, oldPassword, newPassword);
      toast.success('Contraseña actualizada correctamente.');
      navigate(state.user ? paths.user : paths.home);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || '';
      if (message.includes('NotAuthorizedException') || message.includes('Incorrect')) {
        setError('La contraseña actual es incorrecta.');
      } else {
        setError(message || 'Error al cambiar contraseña. Intenta de nuevo.');
      }
      toast.error(message || 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!state.user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Debes iniciar sesión para cambiar tu contraseña.</p>
          <Link to={paths.login}>
            <Button>Iniciar sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <Link
            to={paths.user}
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Award className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">Loyalty Platform</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Cambiar contraseña</h1>
            <p className="mt-2 text-muted-foreground">
              Ingresa tu contraseña actual y la nueva contraseña
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Contraseña actual</Label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  type={showOldPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña actual"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showOldPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showNewPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repite la nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Actualizando...
                </>
              ) : (
                'Cambiar contraseña'
              )}
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 hero-gradient relative items-center justify-center">
        <div className="text-center text-primary-foreground p-12">
          <Award className="h-24 w-24 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Seguridad</h2>
          <p className="text-primary-foreground/80 max-w-md">
            Mantén tu cuenta segura actualizando tu contraseña periódicamente.
          </p>
        </div>
      </div>
    </div>
  );
}
