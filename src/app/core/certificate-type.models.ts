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

/** Mirrors API {@code CertificateTypeFieldDto} — defines extra inputs per {@code CertificateTypeDto}. */
export interface CertificateTypeFieldDto {
  id: string;
  fieldKey: string;
  labelMr: string;
  /** When API adds English copy for dynamic labels. */
  labelEn?: string | null;
  placeholderMr?: string | null;
  placeholderEn?: string | null;
  helpTextMr?: string | null;
  helpTextEn?: string | null;
  /** TEXT, TEXTAREA, DATE, NUMBER, SELECT, or FILE */
  dataType: string;
  required: boolean;
  sortOrder: number;
  /** SELECT options: {@code { value, label_mr }[]} */
  optionsJson?: unknown;
  maxFiles?: number | null;
  maxBytes?: number | null;
}

/** Request row for {@code extraFields} on {@code CertificateTypeUpsertRequest}. */
export interface CertificateTypeFieldUpsertRequest {
  fieldKey: string;
  labelMr: string;
  labelEn?: string | null;
  placeholderMr?: string | null;
  placeholderEn?: string | null;
  helpTextMr?: string | null;
  helpTextEn?: string | null;
  dataType: string;
  required: boolean;
  sortOrder: number;
  optionsJson?: unknown;
  maxFiles?: number | null;
  maxBytes?: number | null;
}

/** Body for {@code POST /api/certificate-types} — staff re-auth plus nested type payload. */
export interface CertificateTypeCreateRequest {
  identifier: string;
  password: string;
  certificateType: CertificateTypeUpsertRequest;
}

/** Request body for {@code POST /api/certificate-types} (tenant-owned type). */
export interface CertificateTypeUpsertRequest {
  code: string;
  category: CertificateTypeCategory;
  nameMr: string;
  nameEn: string;
  descriptionMr: string;
  descriptionEn: string;
  extraFieldsSectionTitleMr: string;
  extraFieldsSectionTitleEn: string;
  defaultFeeAmount: number;
  estimatedDaysTxt: string;
  icon?: string | null;
  sortOrder: number;
  active: boolean;
  extraFields?: CertificateTypeFieldUpsertRequest[];
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
  /** Dynamic form rows from {@code certificate_type_field}; empty when none configured. */
  extraFields?: CertificateTypeFieldDto[];
}
