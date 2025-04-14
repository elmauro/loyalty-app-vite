// src/hooks/useToast.ts
import { toast } from 'react-toastify';

export function useToast() {
  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);
  const info = (message: string) => toast.info(message);
  const warn = (message: string) => toast.warn(message);

  return { success, error, info, warn };
}
