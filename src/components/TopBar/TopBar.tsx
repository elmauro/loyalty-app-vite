import { useAuth } from '@/store/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getTenantForRequest } from '@/utils/token';
import { isCognitoEnabled, signOut as cognitoSignOut } from '@/services/cognitoService';
import { paths } from '@/routes/paths';
import { ROLE_PROGRAM_ADMIN } from '@/constants/auth';
import { LogOut, Award, KeyRound, Settings } from 'lucide-react';

export default function TopBar() {
  const { state, dispatch } = useAuth();
  const navigate = useNavigate();
  const user = state.user;
  const tenant = getTenantForRequest();
  const tenantName = tenant?.name;

  const handleLogout = () => {
    cognitoSignOut();
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('authData');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Award className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <span className="text-lg font-semibold text-foreground">Loyalty Platform</span>
            {tenantName && (
              <span className="text-sm font-medium text-muted-foreground">{tenantName}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user?.roles?.includes(ROLE_PROGRAM_ADMIN) && (
            <Link to={paths.programAdministration}>
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Administración</span>
              </Button>
            </Link>
          )}
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Bienvenido, <span className="font-medium text-foreground">{user?.firstname ?? user?.identification}</span>
          </span>
          {isCognitoEnabled() && (
            <Link to={paths.changePassword}>
              <Button variant="ghost" size="sm" className="gap-2">
                <KeyRound className="h-4 w-4" />
                <span className="hidden sm:inline">Cambiar contraseña</span>
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
