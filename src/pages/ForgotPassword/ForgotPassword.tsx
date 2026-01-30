import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Award, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setIsLoading(true);

    // Aquí podrías llamar a un endpoint o simularlo con MSW
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    setIsSubmitted(true);
    toast.success('Si el email existe, recibirás instrucciones en breve.');
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
            <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
            <p className="mt-2 text-muted-foreground">
              Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
            </p>
          </div>

          {isSubmitted ? (
            <div className="animate-fade-in">
              <div className="rounded-xl bg-success/10 p-6 text-center">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-foreground mb-2">Email enviado</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  If the email exists, you will receive instructions shortly.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Volver al Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Enter your email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`h-11 pl-10 ${error ? 'border-destructive' : ''}`}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          )}

          {!isSubmitted && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿Recordaste tu contraseña?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 hero-gradient relative items-center justify-center">
        <div className="text-center text-primary-foreground p-12">
          <Mail className="h-24 w-24 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Recupera tu acceso</h2>
          <p className="text-primary-foreground/80 max-w-md">
            Te ayudaremos a restablecer tu contraseña de forma rápida y segura.
          </p>
        </div>
      </div>
    </div>
  );
}
