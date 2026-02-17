import { authHandlers } from './authHandlers';
import { otpHandlers } from './otpHandlers';
import { transactionHandlers } from './transactionHandlers';
import { rulesHandlers } from './rulesHandlers';

export const handlers = [
  ...authHandlers,
  ...otpHandlers,
  ...transactionHandlers,
  ...rulesHandlers,
];