import type { Tenant } from './tenant.models';

/** Body for {@code POST /api/tenants}. */
export interface TenantCreateRequest {
  districtCode: string;
  tenantCode: string;
  name: string;
  tenantId?: string | null;
  gpCode: string;
  displayNameEn?: string | null;
  displayNameMr?: string | null;
  talukaEn?: string | null;
  talukaMr?: string | null;
  status?: string | null;
  planType?: string | null;
  subscriptionStartDate?: string | null;
  subscriptionEndDate?: string | null;
  maxUsers?: number | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  logoUrl?: string | null;
  imageUrl?: string | null;
}

export type TenantProvisionResult = Tenant;
