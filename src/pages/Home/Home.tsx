import { Link } from 'react-router-dom';
import styles from './Home.module.scss';

export default function Home() {
  return (
    <div className={styles.homeContainer}>
      <h1>Loyalty Platform</h1>
      <p>Welcome to our Loyalty Platform. Choose an option to get started:</p>

      <div className={styles.homeLinks}>
        <Link to="/login">Sign In</Link>
        <Link to="/registration">Sign Up</Link>
        <Link to="/forgot-password">Forgot Password</Link>
        <a href="https://your-docs-url.com" target="_blank" rel="noopener noreferrer">
          Documentation
        </a>
      </div>
    </div>
  );
}
