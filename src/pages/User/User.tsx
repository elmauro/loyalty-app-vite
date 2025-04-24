import { useState } from 'react';
import { getTransactions } from '../../services/transactionService';
import { useAuth } from '../../store/AuthContext';
import TransactionTable from '../../components/TransactionsTable/TransactionTable';
import { toast } from 'react-toastify';
import { Transaction } from '../../types/Transaction';
import styles from './User.module.scss';

export default function UserPage() {
  const { state } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const user = state.user;
  const phoneNumber = user?.identification || '';

  const handleFind = async () => {
    try {
      const data = await getTransactions(
        '1',
        phoneNumber,
        startDate,
        endDate
      );
      setTransactions(data);
    } catch {
      toast.error('Error al consultar transacciones');
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setTransactions([]);
  };

  return (
    <section className={styles.userPage}>
      <h3>Historial de Transacciones</h3>
      <div className={styles.filterSection}>
        <input
          data-testid="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          data-testid="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={handleFind}>Find</button>
        <button onClick={handleClear}>Clear</button>
      </div>

      <TransactionTable transactions={transactions} />
    </section>
  );
}
