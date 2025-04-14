import AccumulationForm from '../../components/AccumulationForm/AccumulationForm';
import RedemptionForm from '../../components/RedemptionForm/RedemptionForm';
import TransactionHistory from '../../components/TransactionHistoryForm/TransactionHistoryForm';
import { ToastContainer } from 'react-toastify';
import styles from './Administration.module.scss';

export default function Administration() {
  return (
    <div className={styles.administrationPage}>
      <AccumulationForm />
      <RedemptionForm />
      <TransactionHistory />
      <ToastContainer />
    </div>
  );
}
