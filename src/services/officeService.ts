import axiosApp from './axiosInstance';
import {
  OFFICE_GET_PATH,
  OFFICE_GET_BY_ID_PATH,
  OFFICE_ADD_PATH,
  OFFICE_UPDATE_PATH,
} from './apiConfig';
import type { Office } from '@/types/program';

export interface CreateOfficeInput {
  name: string;
  cityId: number;
  address: string;
  description?: string;
  phoneNumber?: string;
  isDefault?: number;
}

export interface UpdateOfficeInput {
  name?: string;
  cityId?: number;
  address?: string;
  description?: string;
  phoneNumber?: string;
  isDeleted?: number;
  isDefault?: number;
}

export async function fetchOfficesByTenant(
  tenantId: string,
  includeDeleted = false
): Promise<Office[]> {
  const params = includeDeleted ? { includeDeleted: 'true' } : undefined;
  const { data } = await axiosApp.get<Office[]>(
    `/${OFFICE_GET_PATH}/tenants/${tenantId}/offices`,
    { params }
  );
  return Array.isArray(data) ? data : [];
}

/** Obtiene la oficina por defecto del tenant (?default=true). Retorna null si no hay. */
export async function fetchOfficeDefaultByTenant(tenantId: string): Promise<Office | null> {
  const { data } = await axiosApp.get<Office[]>(
    `/${OFFICE_GET_PATH}/tenants/${tenantId}/offices`,
    { params: { default: 'true' } }
  );
  const arr = Array.isArray(data) ? data : [];
  return arr.length > 0 ? arr[0] : null;
}

export async function fetchOfficeById(
  tenantId: string,
  officeId: string
): Promise<Office> {
  const { data } = await axiosApp.get<Office>(
    `/${OFFICE_GET_BY_ID_PATH}/tenants/${tenantId}/offices/${officeId}`
  );
  return data;
}

export async function createOffice(
  tenantId: string,
  input: CreateOfficeInput
): Promise<{ officeId: string }> {
  const { data } = await axiosApp.post<{ officeId: string; rowCount: number }>(
    `/${OFFICE_ADD_PATH}/tenants/${tenantId}/offices`,
    {
      name: input.name,
      cityId: input.cityId,
      address: input.address,
      ...(input.description != null && { description: input.description }),
      ...(input.phoneNumber != null && { phoneNumber: input.phoneNumber }),
      ...(input.isDefault != null && { isDefault: input.isDefault }),
    }
  );
  return { officeId: String(data.officeId) };
}

export async function updateOffice(
  tenantId: string,
  officeId: string,
  input: UpdateOfficeInput
): Promise<void> {
  await axiosApp.put(
    `/${OFFICE_UPDATE_PATH}/tenants/${tenantId}/offices/${officeId}`,
    { ...input }
  );
}

export async function deactivateOffice(
  tenantId: string,
  officeId: string
): Promise<void> {
  await updateOffice(tenantId, officeId, { isDeleted: 1 });
}

export async function reactivateOffice(
  tenantId: string,
  officeId: string
): Promise<void> {
  await updateOffice(tenantId, officeId, { isDeleted: 0 });
}
