import axiosApp from './axiosInstance';
import { ADMIN_TENANT_ADMINS_PATH } from './apiConfig';
import type { TenantAdmin } from '@/types/program';

/** Respuesta del backend para tenant admin */
interface TenantAdminApiItem {
  cognito_sub?: string;
  id?: string;
  email: string;
  given_name?: string;
  family_name?: string;
  tenantIds?: string[];
  tenantId?: string;
  tenantName?: string;
  status?: string;
}

function mapApiToTenantAdmin(item: TenantAdminApiItem, tenantName: string): TenantAdmin {
  return {
    id: item.cognito_sub ?? item.id ?? '',
    email: item.email,
    firstName: item.given_name ?? '',
    lastName: item.family_name ?? '',
    tenantId: item.tenantId ?? item.tenantIds?.[0] ?? '',
    tenantName: item.tenantName ?? tenantName,
    isActive: item.status !== 'inactive',
  };
}

export interface CreateTenantAdminInput {
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  password: string;
  documentNumber: string;
  phoneNumber: string;
}

export async function fetchTenantAdmins(tenantIdToName: Record<string, string>): Promise<TenantAdmin[]> {
  const { data } = await axiosApp.get<TenantAdminApiItem[]>(`/${ADMIN_TENANT_ADMINS_PATH}/tenant-admins`);
  if (!Array.isArray(data)) return [];
  return data.map((item) =>
    mapApiToTenantAdmin(item, tenantIdToName[item.tenantId ?? item.tenantIds?.[0] ?? ''] ?? '')
  );
}

export async function createTenantAdmin(input: CreateTenantAdminInput): Promise<void> {
  await axiosApp.post(`/${ADMIN_TENANT_ADMINS_PATH}/tenant-admins`, {
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    tenantId: input.tenantId,
    password: input.password,
    documentNumber: input.documentNumber,
    phoneNumber: input.phoneNumber,
  });
}

export async function updateTenantAdminStatus(
  cognito_sub: string,
  status: 'active' | 'inactive'
): Promise<void> {
  await axiosApp.patch(
    `/${ADMIN_TENANT_ADMINS_PATH}/tenant-admins/${encodeURIComponent(cognito_sub)}`,
    { status }
  );
}
