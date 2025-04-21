import { useState } from 'react';
import { redeemPoints } from '../../services/transactionService';
import { sendOtp } from '../../services/otpService';
import { useToast } from '../../hooks/useToast';
import styles from './RedemptionForm.module.scss';
import { getRedemptionErrorMessage } from '../../utils/getRedemptionErrorMessage';

export default function RedemptionForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [points, setPoints] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpVisible, setOtpVisible] = useState(false);
  const { success, error } = useToast();

  const handleRedeemRequest = async () => {
    try {
      await sendOtp({ phoneNumber });
      setOtpVisible(true);
    } catch {
      error('Error solicitando OTP');
    }
  };

  const handleRedeemConfirm = async () => {
    try {
      await redeemPoints({ phoneNumber, identificationTypeId: 1, otpCode, points: +points });
      success('Puntos redimidos');
      setOtpVisible(false);
    } catch (err: any) {
      if (err.response) {
        error(getRedemptionErrorMessage(err.response.status));
      } else {
        error('Error de conexión. Intenta más tarde.');
      }
    }
  };

  return (
    <section className={styles['redemption-form']}>
      <h3>Redención</h3>
      <input placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
      <input placeholder="Puntos" type="number" value={points} onChange={(e) => setPoints(e.target.value)} />
      <button onClick={handleRedeemRequest}>Redimir</button>
      <button onClick={() => { setPhoneNumber(''); setPoints(''); }}>Limpiar</button>

      {otpVisible && (
        <div style={{ border: '1px solid black', marginTop: '1rem', padding: '1rem' }}>
          <h4>OTP</h4>
          <input placeholder="Código OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
          <button onClick={handleRedeemConfirm}>Confirmar</button>
          <button onClick={() => setOtpVisible(false)}>Cancelar</button>
        </div>
      )}
    </section>
  );
}
