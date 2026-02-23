import { authHandlers } from './authHandlers';
import { otpHandlers } from './otpHandlers';
import { transactionHandlers } from './transactionHandlers';
import { rulesHandlers } from './rulesHandlers';
import { programHandlers } from './programHandlers';

export const handlers = [
  ...authHandlers,
  ...otpHandlers,
  ...transactionHandlers,
  ...rulesHandlers,
  ...programHandlers,
];