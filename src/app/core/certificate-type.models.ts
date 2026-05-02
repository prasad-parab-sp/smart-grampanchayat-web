/**
 * Catalog grouping from {@code CertificateType.category} / Jackson on Java {@code CertificateTypeDto}.
 * Wire format is the enum name as a JSON string (e.g. birth rows use {@code "CERTIFICATE"}).
 *
 * @example {@code category: "CERTIFICATE"} on {@code CERT_BIRTH} from {@code GET /api/certificate-types}
 */
export enum CertificateTypeCategory {
  CERTIFICATE = 'CERTIFICATE',
  REGISTRATION = 'REGISTRATION',
  PERMISSIONS = 'PERMISSIONS',
  OTHERS = 'OTHERS'
}

/** Mirrors {@code TenantCertificateTypeConfigDto} from certificate-types API when a tenant row exists. */
export interface TenantCertificateTypeConfigDto {
  id: string;
  tenantId: string;
  feeAmount: number;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CertificateTypeDto {
  id: string;
  tenantId: string | null;
  code: string;
  category: CertificateTypeCategory;
  nameMr: string;
  nameEn?: string | null;
  descriptionMr?: string | null;
  descriptionEn?: string | null;
  extraFieldsSectionTitleMr?: string | null;
  extraFieldsSectionTitleEn?: string | null;
  defaultFeeAmount: number;
  /** Fee for this tenant as returned by the API (computed server-side only). */
  feeAmount: number;
  /** Present when API returned a {@code tenant_certificate_type_config} row for this type + tenant. */
  tenantCertificateTypeConfig?: TenantCertificateTypeConfigDto | null;
  estimatedDaysTxt?: string | null;
  /** Optional emoji / glyph for catalog UI; null → client uses category default. */
  icon?: string | null;
  sortOrder: number;
  /** Jackson may emit {@code active} and/or {@code isActive} for the same field. */
  active?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
