import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { buildUserFromToken, decodeJwtPayload, getOauthidFromPayload } from '@/utils/token';
import type { AuthUser } from '@/types/Auth';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
}

type AuthAction = { type: 'LOGIN'; payload: AuthUser } | { type: 'LOGOUT' } | { type: 'STOP_LOADING' };

interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, isLoading: false };
    case 'STOP_LOADING':
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

/** Convierte respuesta mínima o legada a AuthUser completo. */
function toAuthUser(data: Record<string, unknown>): AuthUser | null {
  const token = data?.token as string | undefined;
  const firstname = data?.firstname as string | undefined;
  if (!token || !firstname) return null;
  const oauthid =
    (data?.oauthid as string) ||
    (data?.sub as string) ||
    getOauthidFromPayload(decodeJwtPayload(token)) ||
    'legacy';
  return buildUserFromToken(token, firstname, oauthid);
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const storedData = localStorage.getItem('authData');
    if (storedData) {
      const data = JSON.parse(storedData) as Record<string, unknown>;
      const user = toAuthUser(data);
      if (user) dispatch({ type: 'LOGIN', payload: user });
      else dispatch({ type: 'STOP_LOADING' });
    } else {
      dispatch({ type: 'STOP_LOADING' });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

