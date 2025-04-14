import { Outlet } from 'react-router-dom';
import TopBar from '../components/TopBar/TopBar';
import styles from './ProtectedLayout.module.scss';

export default function ProtectedLayout() {
  return (
    <div className={styles.protectedLayout}>
      <TopBar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
