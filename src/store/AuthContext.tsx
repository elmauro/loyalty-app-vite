import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Define tipos
interface AuthState {
  user: any | null;
  isLoading: boolean;
}

type AuthAction = { type: 'LOGIN'; payload: any } | { type: 'LOGOUT' } | { type: 'STOP_LOADING' };

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


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ✅ Restaurar sesión automáticamente
  useEffect(() => {
    const storedData = localStorage.getItem('authData');
    if (storedData) {
      const user = JSON.parse(storedData);
      dispatch({ type: 'LOGIN', payload: user });
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

