import { useState } from 'react';
import { getTransactions } from '../../services/transactionService';
import { toast } from 'react-toastify';
import TransactionTable from '../TransactionsTable/TransactionTable';
import { Transaction } from '../../types/Transaction';
import styles from './TransactionHistoryForm.module.scss';

export default function TransactionHistory() {
  const [documentNumber, setDocumentNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleFind = async () => {
    const doc = documentNumber.trim();
    if (!doc) {
      toast.error('Ingresa el número de documento para consultar');
      return;
    }
    try {
      const data = await getTransactions('1', doc, startDate, endDate);
      setTransactions(data);
    } catch {
      toast.error('Error al consultar transacciones');
    }
  };

  return (
    <section className={styles['transaction-history-form']}>
      <h3>Historial de Transacciones</h3>
      <input placeholder="Document Number" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
      <input data-testid="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input data-testid="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      <button onClick={handleFind}>Buscar</button>
      <button onClick={() => { setDocumentNumber(''); setStartDate(''); setEndDate(''); setTransactions([]); }}>Limpiar</button>

      <TransactionTable transactions={transactions} />
    </section>
  );
}
