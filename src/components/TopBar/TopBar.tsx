import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './TopBar.module.scss';

export default function TopBar() {
  const { state, dispatch } = useAuth();
  const navigate = useNavigate();

  const user = state.user;

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('authData');
    navigate('/login');
  };

  return (
    <div className={styles.topBar}>
      <div>
        👋 Welcome, <strong>{user?.firstname || user?.identification}</strong>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
