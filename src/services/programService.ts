import axiosApp from './axiosInstance';
import { ADMIN_PROGRAM_PATH, ADMIN_PROGRAM_PUT_PATH } from './apiConfig';
import type { Program } from '@/types/program';

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
      income: Array.isArray(data.transactionsType?.income) ? data.transactionsType.income : ['sale', 'rule'],
      expense: Array.isArray(data.transactionsType?.expense) ? data.transactionsType.expense : ['redemption', 'rule'],
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
