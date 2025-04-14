import { authHandlers } from './authHandlers';
import { otpHandlers } from './otpHandlers';
import { transactionHandlers } from './transactionHandlers';

export const handlers = [
  ...authHandlers,
  ...otpHandlers,
  ...transactionHandlers,
];