import axiosApp from './axiosInstance';
import { ADMIN_PROGRAM_PATH, ADMIN_PROGRAM_PUT_PATH, ADMIN_PROGRAM_TRANSACTION_TYPES_PATH } from './apiConfig';
import type { Program } from '@/types/program';

export interface TransactionTypes {
  income: string[];
  expense: string[];
}

/** Obtiene solo los tipos de transacción. Usa validateAdmin (tenant admins pueden consultar). */
export async function fetchTransactionTypes(): Promise<TransactionTypes> {
  const { data } = await axiosApp.get<TransactionTypes>(`/${ADMIN_PROGRAM_TRANSACTION_TYPES_PATH}/admin/transaction-types`);
  return {
    income: Array.isArray(data.income) ? data.income : ['sale'],
    expense: Array.isArray(data.expense) ? data.expense : ['redemption'],
  };
}

export async function fetchProgram(): Promise<Program> {
  const { data } = await axiosApp.get<Program>(`/${ADMIN_PROGRAM_PATH}/admin/program`);
  return {
    programId: data.programId ?? '',
    name: data.name ?? '',
    description: data.description ?? '',
    conversionValue: Number(data.conversionValue) ?? 0,
    pointsMoneyRatio: Number(data.pointsMoneyRatio) ?? 0,
    periodId: Number(data.periodId) ?? 0,
    periodValue: Number(data.periodValue) ?? 0,
    ruleEngine: data.ruleEngine ?? 'nools',
    transactionsType: {
      income: Array.isArray(data.transactionsType?.income) ? data.transactionsType.income : ['sale'],
      expense: Array.isArray(data.transactionsType?.expense) ? data.transactionsType.expense : ['redemption'],
    },
  };
}

export async function updateProgram(program: Program): Promise<void> {
  await axiosApp.put(`/${ADMIN_PROGRAM_PUT_PATH}/admin/program`, {
    name: program.name,
    description: program.description,
    conversionValue: program.conversionValue,
    pointsMoneyRatio: program.pointsMoneyRatio,
    periodId: program.periodId,
    periodValue: program.periodValue,
    ruleEngine: program.ruleEngine,
    transactionsType: program.transactionsType,
  });
}
