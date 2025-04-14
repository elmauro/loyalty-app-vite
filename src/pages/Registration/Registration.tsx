import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Registration.module.scss';

export default function Registration() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phoneNumber: '',
    birthDate: '',
    documentNumber: '',
    email: '',
    password: '',
    termsAccepted: false
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.termsAccepted) {
      setError('You must accept the terms and conditions.');
      return;
    }

    navigate('/login');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.registrationForm}>
      <h2>Sign Up</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}

      <input
        name="phoneNumber"
        placeholder="Phone Number"
        value={form.phoneNumber}
        onChange={handleChange}
      />
      <input
        name="birthDate"
        type="date"
        placeholder="Birth Date"
        value={form.birthDate}
        onChange={handleChange}
      />
      <input
        name="documentNumber"
        placeholder="Document Number"
        value={form.documentNumber}
        onChange={handleChange}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
      />

      <div className={styles.terms}>
        <input
          type="checkbox"
          name="termsAccepted"
          checked={form.termsAccepted}
          onChange={handleChange}
          id="terms"
        />
        <label htmlFor="terms">I accept the Terms and Conditions</label>
      </div>

      <button type="submit">Register</button>

      <div className={styles.registrationLinks}>
        <p>Already have an account? <Link to="/login">Sign in</Link></p>
        <Link to="/">Back to Home</Link>
      </div>
    </form>
  );
}
