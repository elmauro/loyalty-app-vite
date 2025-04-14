import { useAuth } from '../store/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { state } = useAuth();
  const { user, isLoading } = state;

  if (isLoading) {
    return <div>Loading...</div>; // o spinner
  }

  const userRole = user?.roles?.[0];
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

