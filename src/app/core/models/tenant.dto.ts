/** Mirrors the Spring `Tenant` JSON shape used by `/api/tenants`. Extend as the API grows. */
export interface TenantDto {
  id: string;
  tenantId?: string | null;
  tenantCode: string;
  name: string;
  displayName?: string | null;
  gpCode?: string;
  status?: string;
  planType?: string;
  logoUrl?: string | null;
  imageUrl?: string | null;
  contactMobile?: string | null;
  maxUsers?: number | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
