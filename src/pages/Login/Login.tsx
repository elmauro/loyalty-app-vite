import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuth } from '../../store/AuthContext';
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
    try {
      const data = await login({
        loginTypeId: 1,
        identificationTypeId: 1,
        login: loginValue,
        pass: password
      });

      dispatch({ type: 'LOGIN', payload: data });

      if (rememberMe) {
        localStorage.setItem('authData', JSON.stringify(data));
      }

      const role = data.roles?.[0];
      if (role === '1') navigate('/administration');
      else if (role === '2') navigate('/user');
      else navigate('/');
    } catch (err) {
      setError('Credenciales inválidas');
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
