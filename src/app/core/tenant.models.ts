/**
 * Tenant from **`GET /api/tenants?tenantCode=`** — district shard row (`ShardTenant`), Jackson camelCase.
 */
export interface Tenant {
  id: string;
  tenantId: string | null;
  tenantCode: string;
  name: string;
  displayNameEn: string | null;
  displayNameMr: string | null;
  gpCode: string | null;
  districtNameEn: string | null;
  districtNameMr: string | null;
  talukaEn: string | null;
  talukaMr: string | null;
  status: string;
  planType: string;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  maxUsers: number | null;
  contactEmail: string | null;
  contactPhone: string | null;
  logoUrl: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  /** From district {@code grampanchayat} row (certificate footer). */
  sarpanchName?: string | null;
  gramsevakName?: string | null;
}
