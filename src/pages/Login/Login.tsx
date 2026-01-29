import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuth } from '../../store/AuthContext';
import { getLoginErrorMessage } from '../../utils/getLoginErrorMessage';
import { ROLE_ADMIN, ROLE_CUSTOMER } from '../../constants/auth';
import styles from './Login.module.scss';

export default function Login() {
  const [loginValue, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!loginValue || !password) {
      setError('Credenciales inválidas');
      return;
    }

    try {
      const data = await login({
        loginTypeId: 1,
        identificationTypeId: 1,
        login: loginValue,
        pass: password
      });

      dispatch({ type: 'LOGIN', payload: data });

      // Siempre guardar JWT en localStorage para usarlo en x-access-token en las peticiones
      localStorage.setItem('authData', JSON.stringify(data));

      // Rol 1 = Administration (iscustomer 0), Rol 2 = Customer (iscustomer 1)
      const role = data.roles?.[0];
      if (role === ROLE_ADMIN) navigate('/administration');
      else if (role === ROLE_CUSTOMER) navigate('/user');
      else navigate('/');
    } catch (err: any) {
      if (err.response) {
        setError(getLoginErrorMessage(err.response.status));
      } else {
        setError('Error de conexión. Intenta más tarde.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      <h2>Login</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}

      <input
        value={loginValue}
        onChange={(e) => setLogin(e.target.value)}
        placeholder="Login"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <div className={styles.rememberMe}>
        <input
          type="checkbox"
          id="rememberMe"
          checked={rememberMe}
          onChange={() => setRememberMe(!rememberMe)}
        />
        <label htmlFor="rememberMe">Remember me</label>
      </div>

      <button type="submit">Sign In</button>

      <div className={styles.loginLinks}>
        <Link to="/registration">Sign Up</Link>
        <Link to="/forgot-password">Forgot password</Link>
        <Link to="/">Back to Home</Link>
      </div>
    </form>
  );
}
