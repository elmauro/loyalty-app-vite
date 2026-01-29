import { PHONE_COUNTRY_CODE } from '../services/apiConfig';

/**
 * Devuelve el número con código de país (ej. 57) antepuesto.
 * - Solo dígitos. Si ya empieza por el código de país, no se duplica.
 * - El usuario puede escribir "3001234567" o "57 300 123 4567"; se normaliza y se envía "573001234567".
 */
export function formatPhoneWithCountryCode(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith(PHONE_COUNTRY_CODE)) return digits;
  return PHONE_COUNTRY_CODE + digits;
}
