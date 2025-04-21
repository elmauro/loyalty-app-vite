import { useState } from 'react';
import { accumulatePoints } from '../../services/transactionService';
import { toast } from 'react-toastify';
import { getAccumulationErrorMessage } from '../../utils/getAccumulationErrorMessage';
import styles from './AccumulationForm.module.scss';

export default function AccumulationForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [value, setValue] = useState('');

  const handleAccumulate = async () => {
    try {
      await accumulatePoints({ phoneNumber, identificationTypeId: 1, value: Number(value) });
      toast.success('Puntos acumulados');
    } catch (err: any) {
      if (err.response) {
        toast.error(getAccumulationErrorMessage(err.response.status));
      } else {
        toast.error('Error de conexión. Intenta más tarde.');
      }
    }
  };

  return (
    <section className={styles['accumulation-form']}>
      <h3>Acumulación</h3>
      <input placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
      <input placeholder="Valor $" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={handleAccumulate}>Acumular</button>
      <button onClick={() => { setPhoneNumber(''); setValue(''); }}>Limpiar</button>
    </section>
  );
}
