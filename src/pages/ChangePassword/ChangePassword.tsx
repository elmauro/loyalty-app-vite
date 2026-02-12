import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { changePassword, isCognitoEnabled } from '@/services/cognitoService';
import { getEmailFromAuth } from '@/utils/token';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { paths } from '@/routes/paths';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const email = getEmailFromAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Completa todos los campos');
      return;
    }
    if (formData.newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
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
      await changePassword(email, formData.currentPassword, formData.newPassword);
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
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">Debes iniciar sesión para cambiar tu contraseña.</p>
          <Link to={paths.login}>
            <Button>Iniciar sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <Link
        to={state.user ? paths.user : paths.home}
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  className="h-11 pr-10"
                  placeholder="Tu contraseña actual"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPasswords.current ? 'Ocultar' : 'Mostrar'}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="h-11 pr-10"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPasswords.new ? 'Ocultar' : 'Mostrar'}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="h-11 pr-10"
                  placeholder="Repite la nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPasswords.confirm ? 'Ocultar' : 'Mostrar'}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">{error}</div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Actualizando...
                  </>
                ) : (
                  'Cambiar Contraseña'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(state.user ? paths.user : paths.home)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
