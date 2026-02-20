import axiosApp from './axiosInstance';
import { TENANTS_GET_PATH, TENANTS_POST_PATH, TENANTS_PUT_PATH } from './apiConfig';
import type { Tenant } from '@/types/program';

/** Respuesta del backend: usa tenantid */
interface TenantApiItem {
  tenantid?: string;
  tenantId?: string;
  name: string;
  tenantCode: string;
  identification: string;
  identificationTypeId?: string;
  conversionValue?: number;
  pointsMoneyRatio?: number;
}

function mapApiToTenant(item: TenantApiItem): Tenant {
  return {
    tenantId: item.tenantid ?? item.tenantId ?? '',
    name: item.name,
    tenantCode: item.tenantCode,
    identification: item.identification,
    identificationTypeId: item.identificationTypeId ?? '3',
    conversionValue: item.conversionValue ?? 0,
    pointsMoneyRatio: item.pointsMoneyRatio ?? 0,
    isdeleted: 0,
  };
}

export interface CreateTenantInput {
  name: string;
  tenantCode: string;
  identification: string;
  conversionValue: number;
  pointsMoneyRatio: number;
}

export interface UpdateTenantInput {
  name: string;
  identification: string;
  isDeleted?: number;
  tenantCode?: string;
  conversionValue?: number;
  pointsMoneyRatio?: number;
}

export async function fetchTenants(): Promise<Tenant[]> {
  const { data } = await axiosApp.get<TenantApiItem[]>(`/${TENANTS_GET_PATH}/tenants`);
  if (!Array.isArray(data)) return [];
  return data.map(mapApiToTenant);
}

export async function createTenant(input: CreateTenantInput): Promise<{ id: string }> {
  const { data } = await axiosApp.post<{ id: string; rowCount: number }>(`/${TENANTS_POST_PATH}/tenants`, {
    name: input.name,
    tenantCode: input.tenantCode,
    identification: input.identification,
    conversionValue: input.conversionValue,
    pointsMoneyRatio: input.pointsMoneyRatio,
  });
  return { id: String(data.id) };
}

export async function updateTenant(
  tenantId: string,
  input: UpdateTenantInput
): Promise<void> {
  await axiosApp.put(`/${TENANTS_PUT_PATH}/tenants/${tenantId}`, {
    name: input.name,
    identification: input.identification,
    isDeleted: input.isDeleted ?? 0,
    ...(input.tenantCode != null && { tenantCode: input.tenantCode }),
    ...(input.conversionValue != null && { conversionValue: input.conversionValue }),
    ...(input.pointsMoneyRatio != null && { pointsMoneyRatio: input.pointsMoneyRatio }),
  });
}

export async function deactivateTenant(
  tenantId: string,
  currentTenant: { name: string; identification: string }
): Promise<void> {
  await updateTenant(tenantId, {
    name: currentTenant.name,
    identification: currentTenant.identification,
    isDeleted: 1,
  });
}
