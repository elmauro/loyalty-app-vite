import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ForgotPassword.module.scss';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Aquí podrías llamar a un endpoint o simularlo con MSW
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.forgotPasswordForm}>
      <h2>Forgot Password</h2>

      {submitted ? (
        <p className={styles.successMessage}>
          If the email exists, you will receive instructions shortly.
        </p>
      ) : (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
        </>
      )}

      <div className={styles.forgotLinks}>
        <p>
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
        <Link to="/">Back to Home</Link>
      </div>
    </form>
  );
}
