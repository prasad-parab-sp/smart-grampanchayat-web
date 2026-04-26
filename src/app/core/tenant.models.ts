/**
 * Shapes for GET /api/tenants?tenantCode= (Jackson camelCase).
 */
export interface DistrictDto {
  id: string;
  districtCode: string;
  districtAdminId?: string | null;
  name: string;
  displayNameMr: string | null;
  displayNameEn: string | null;
  state: string;
  status: string;
  panchayatCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TenantDto {
  id: string;
  tenantId: string | null;
  tenantCode: string;
  name: string;
  displayNameMr: string | null;
  displayNameEn: string | null;
  gpCode: string;
  talukaMr: string | null;
  talukaEn: string | null;
  status: string;
  planType: string;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  maxUsers: number | null;
  contactMobile: string | null;
  logoUrl: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  district: DistrictDto;
}
