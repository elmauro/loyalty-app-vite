import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, loginWithCognitoToken } from '@/services/authService';
import { signIn as cognitoSignIn, isCognitoEnabled } from '@/services/cognitoService';
import { useAuth } from '@/store/AuthContext';
import { buildUserFromToken } from '@/utils/token';
import { getLoginErrorMessage } from '@/utils/getLoginErrorMessage';
import { getErrorStatus } from '@/utils/getErrorStatus';
import { getDefaultPathForRole } from '@/constants/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Award, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function Login() {
  const formRef = useRef<HTMLFormElement>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const loginValue = (formData.get('login') as string)?.trim() || '';
    const password = (formData.get('password') as string) || '';

    if (!loginValue || !password) {
      setError('Credenciales inválidas');
      return;
    }

    setIsLoading(true);

    try {
      let data;

      if (isCognitoEnabled()) {
        if (!isEmail(loginValue)) {
          setError('Usa tu email para iniciar sesión. El login con número de documento ya no está disponible.');
          return;
        }
        const idToken = await cognitoSignIn(loginValue, password);
        data = await loginWithCognitoToken(idToken);
      } else {
        data = await login({
          loginTypeId: 1,
          identificationTypeId: 1,
          login: loginValue,
          pass: password,
        });
      }

      const user = buildUserFromToken(data.token, data.firstname, data.oauthid);
      dispatch({ type: 'LOGIN', payload: user });
      localStorage.setItem('authData', JSON.stringify(data));

      const role = user.roles?.[0];
      navigate(getDefaultPathForRole(role ?? ''));
    } catch (err: unknown) {
      const status = getErrorStatus(err);
      const message = (err as { message?: string })?.message;
      const responseData = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      const backendMessage = responseData?.message;
      if (message === 'User does not exist.' || message?.includes('UserNotFoundException')) {
        setError('Usuario no encontrado. Verifica tu email o número de documento.');
      } else if (message === 'Incorrect username or password.' || message?.includes('NotAuthorizedException')) {
        setError('Email o contraseña incorrectos. Verifica tus credenciales.');
      } else if (message === 'User is not confirmed.') {
        setError('Debes confirmar tu cuenta. Revisa tu email.');
      } else if (responseData?.error === 'CognitoRequired' || backendMessage?.includes('Cognito')) {
        setError(backendMessage || 'El login requiere Cognito. Configura las variables de entorno de Cognito.');
      } else {
        setError(status != null ? getLoginErrorMessage(status) : message || 'Error de conexión. Intenta más tarde.');
      }
      toast.error(status != null ? getLoginErrorMessage(status) : message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
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
            <h1 className="text-2xl font-bold text-foreground">Login</h1>
            <p className="mt-2 text-muted-foreground">Ingresa tus credenciales para acceder</p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login">
                {isCognitoEnabled() ? 'Email' : 'Login (Identificación)'}
              </Label>
              <Input
                id="login"
                name="login"
                type="text"
                inputMode={isCognitoEnabled() ? 'email' : 'numeric'}
                placeholder={isCognitoEnabled() ? 'tu@email.com' : 'Número de documento'}
                className="h-11"
                data-testid="login-username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  className="h-11 pr-10"
                  data-testid="login-password"
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
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link to="/registration" className="font-medium text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 hero-gradient relative items-center justify-center">
        <div className="text-center text-primary-foreground p-12">
          <Award className="h-24 w-24 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Bienvenido de vuelta</h2>
          <p className="text-primary-foreground/80 max-w-md">
            Accede a tu cuenta para gestionar tus puntos, realizar redenciones y consultar tu historial de transacciones.
          </p>
        </div>
      </div>
    </div>
  );
}
