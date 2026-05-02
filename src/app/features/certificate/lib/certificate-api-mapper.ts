import { CertificateTypeCategory, CertificateTypeDto } from '../../../core/certificate-type.models';
import type { SupportedLang } from '../../../i18n/i18n.service';
import {
  CertificateCatalogRow,
  CertificateCatalogSectionRow,
  CertificateCatalogTypeRow
} from '../data/certificate-catalog.data';

/**
 * Fixed catalog sections (UI order). Matches API {@code CertificateTypeCategory}:
 * Certificate → REGISTRATION → License ({@code PERMISSIONS}) → Other ({@code OTHERS}).
 * Each {@link CertificateTypeDto} is placed under {@link CertificateTypeDto#category}.
 */
const CATEGORY_ORDER: CertificateTypeCategory[] = [
  CertificateTypeCategory.CERTIFICATE,
  CertificateTypeCategory.REGISTRATION,
  CertificateTypeCategory.PERMISSIONS,
  CertificateTypeCategory.OTHERS
];

const SECTION_BY_CATEGORY: Record<
  CertificateTypeCategory,
  Pick<CertificateCatalogSectionRow, 'icon' | 'titleKey'>
> = {
  [CertificateTypeCategory.CERTIFICATE]: { icon: '📄', titleKey: 'CERTIFICATE.SECTION.CERTIFICATES' },
  [CertificateTypeCategory.REGISTRATION]: { icon: '📋', titleKey: 'CERTIFICATE.SECTION.REGISTRATION' },
  [CertificateTypeCategory.PERMISSIONS]: { icon: '📜', titleKey: 'CERTIFICATE.SECTION.LICENSE' },
  [CertificateTypeCategory.OTHERS]: { icon: '📌', titleKey: 'CERTIFICATE.SECTION.OTHER' }
};

function pickName(dto: CertificateTypeDto, lang: SupportedLang): string {
  if (lang === 'en' && dto.nameEn?.trim()) {
    return dto.nameEn.trim();
  }
  return dto.nameMr?.trim() || dto.code;
}

function pickDesc(dto: CertificateTypeDto, lang: SupportedLang): string {
  if (lang === 'en') {
    const en = dto.descriptionEn?.trim();
    if (en) {
      return en;
    }
  }
  return dto.descriptionMr?.trim() || '';
}

/** Display title for a catalog type row or DTO (same fields as API). */
export function certificateCatalogDisplayName(
  row: Pick<CertificateTypeDto, 'code' | 'nameMr' | 'nameEn'>,
  lang: SupportedLang
): string {
  return pickName(row as CertificateTypeDto, lang);
}

/** Display description for a catalog type row or DTO. */
export function certificateCatalogDisplayDescription(
  row: Pick<CertificateTypeDto, 'descriptionMr' | 'descriptionEn'>,
  lang: SupportedLang
): string {
  return pickDesc(row as CertificateTypeDto, lang);
}

/** Display heading above applicant/details block from API {@code extra_fields_section_title_*}. */
export function certificateCatalogExtraSectionTitle(
  row: Pick<CertificateTypeDto, 'extraFieldsSectionTitleMr' | 'extraFieldsSectionTitleEn'>,
  lang: SupportedLang
): string | null {
  if (lang === 'en') {
    const en = row.extraFieldsSectionTitleEn?.trim();
    if (en) {
      return en;
    }
  }
  return row.extraFieldsSectionTitleMr?.trim() || null;
}

/** API nested {@code tenantCertificateTypeConfig} is present for this row. */
export function certificateHasTenantTypeConfig(
  row: Pick<CertificateCatalogTypeRow, 'tenantCertificateTypeConfig'>
): boolean {
  return row.tenantCertificateTypeConfig != null;
}

/**
 * Effective GP fee differs from platform catalog default — show catalog amount as context
 * (nested tenant config row exists from API).
 */
export function certificateShowsCatalogDefaultVersusTenantFee(
  row: Pick<CertificateCatalogTypeRow, 'tenantCertificateTypeConfig' | 'defaultFeeAmount' | 'feeAmount'>
): boolean {
  if (!certificateHasTenantTypeConfig(row)) {
    return false;
  }
  return Number(row.defaultFeeAmount) !== Number(row.feeAmount);
}

export function mapCertificateTypesToCatalogRows(types: CertificateTypeDto[]): CertificateCatalogRow[] {
  const activeOnly = types.filter((t) => t.active !== false && t.isActive !== false);
  const byCategory = new Map<CertificateTypeCategory, CertificateTypeDto[]>();
  for (const c of CATEGORY_ORDER) {
    byCategory.set(c, []);
  }
  for (const t of activeOnly) {
    (byCategory.get(t.category) ?? byCategory.get(CertificateTypeCategory.OTHERS)!).push(t);
  }
  for (const list of byCategory.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const rows: CertificateCatalogRow[] = [];
  for (const cat of CATEGORY_ORDER) {
    const list = byCategory.get(cat) ?? [];
    if (list.length === 0) {
      continue;
    }
    const section = SECTION_BY_CATEGORY[cat];
    rows.push({
      kind: 'section',
      category: cat,
      icon: section.icon,
      titleKey: section.titleKey
    });
    for (const dto of list) {
      const rowIcon = dto.icon?.trim() || section.icon;
      const code = dto.code.trim();
      const complaint =
        code === 'COMPLAINT' ||
        code === 'TICKET_COMPLAINT' ||
        code.endsWith('_COMPLAINT');
      const item: CertificateCatalogTypeRow = {
        kind: 'type',
        id: dto.id,
        tenantId: dto.tenantId ?? null,
        code,
        category: cat,
        nameMr: dto.nameMr ?? '',
        nameEn: dto.nameEn,
        descriptionMr: dto.descriptionMr,
        descriptionEn: dto.descriptionEn,
        extraFieldsSectionTitleMr: dto.extraFieldsSectionTitleMr,
        extraFieldsSectionTitleEn: dto.extraFieldsSectionTitleEn,
        defaultFeeAmount: dto.defaultFeeAmount,
        feeAmount: dto.feeAmount,
        tenantCertificateTypeConfig: dto.tenantCertificateTypeConfig ?? null,
        estimatedDaysTxt: dto.estimatedDaysTxt?.trim() || null,
        icon: rowIcon,
        sortOrder: dto.sortOrder,
        active: dto.active !== false && dto.isActive !== false,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
        docKeys: [],
        uploadKeys: [],
        isComplaint: complaint
      };
      rows.push(item);
    }
  }
  return rows;
}
