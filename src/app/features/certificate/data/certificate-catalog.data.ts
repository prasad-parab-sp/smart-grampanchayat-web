/**
 * Catalog list models: API-aligned type rows plus optional UI section dividers.
 * API payload matches this {@link CertificateTypeDto} (same shape as Java {@code web.dto.CertificateTypeDto}).
 */

import type { CertificateTypeCategory, TenantCertificateTypeConfigDto } from '../../../core/certificate-type.models';

export type CertificateCatalogCategory = CertificateTypeCategory;

/** Synthetic section heading before a category group (not persisted). */
export interface CertificateCatalogSectionRow {
  kind: 'section';
  category: CertificateCatalogCategory;
  icon: string;
  titleKey: string;
}

/**
 * One enabled catalog line from the district shard / API (uniform with DB {@code certificate_type}
 * + tenant fee overlay).
 */
export interface CertificateCatalogTypeRow {
  kind: 'type';
  id: string;
  tenantId: string | null;
  code: string;
  category: CertificateCatalogCategory;
  nameMr: string;
  nameEn?: string | null;
  descriptionMr?: string | null;
  descriptionEn?: string | null;
  extraFieldsSectionTitleMr?: string | null;
  extraFieldsSectionTitleEn?: string | null;
  defaultFeeAmount: number;
  /** Effective fee for current tenant (config override or default). */
  feeAmount: number;
  /** Present when API included a tenant_certificate_type_config row for this type. */
  tenantCertificateTypeConfig?: TenantCertificateTypeConfigDto | null;
  estimatedDaysTxt?: string | null;
  icon?: string | null;
  sortOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;

  docKeys: string[];
  uploadKeys: string[];
  isComplaint?: boolean;
}

export type CertificateCatalogRow = CertificateCatalogSectionRow | CertificateCatalogTypeRow;

/** @deprecated Use {@link CertificateCatalogTypeRow}; kept for gradual rename in templates. */
export type CertificateListItem = CertificateCatalogTypeRow;

export function isCertificateSectionRow(row: CertificateCatalogRow): row is CertificateCatalogSectionRow {
  return row.kind === 'section';
}
