import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Award, ArrowRight, Shield, Gift, History } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="container relative py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 backdrop-blur-sm">
              <Award className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-primary-foreground">Programa de Puntos</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl">
              Loyalty Platform
            </h1>

            <p className="mb-10 text-lg text-primary-foreground/80 md:text-xl">
              Bienvenido a nuestra plataforma de fidelización. Acumula puntos, redime recompensas y consulta tu historial de transacciones.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/login">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/registration">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50L48 45.7C96 41.3 192 32.7 288 35.8C384 39 480 54 576 58.2C672 62.3 768 55.7 864 50C960 44.3 1056 39.7 1152 41.5C1248 43.3 1344 51.7 1392 55.8L1440 60V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">¿Cómo funciona?</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Nuestra plataforma te permite gestionar tus puntos de forma fácil y segura.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<Gift className="h-8 w-8" />}
              title="Acumula Puntos"
              description="Gana puntos con cada compra y ve cómo crece tu saldo."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Redime Seguro"
              description="Canjea tus puntos con verificación OTP para mayor seguridad."
            />
            <FeatureCard
              icon={<History className="h-8 w-8" />}
              title="Consulta Historial"
              description="Revisa todas tus transacciones por rango de fechas."
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Loyalty Platform</span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-6">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link to="/registration" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Sign Up
              </Link>
              <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Forgot Password
              </Link>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Documentación
              </a>
            </nav>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            © 2026 Loyalty Platform Colombia. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card-interactive flex flex-col items-center p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
