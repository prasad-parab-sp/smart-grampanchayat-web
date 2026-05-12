import {
  CertificateTypeCategory,
  CertificateTypeDto,
  CertificateTypeFieldDto
} from '../../../core/certificate-type.models';
import type { SupportedLang } from '../../../i18n/i18n.service';

/**
 * Fixed UI order for grouping certificate types by API {@link CertificateTypeCategory}.
 */
export const CERTIFICATE_CATALOG_CATEGORY_ORDER: CertificateTypeCategory[] = [
  CertificateTypeCategory.CERTIFICATE,
  CertificateTypeCategory.REGISTRATION,
  CertificateTypeCategory.PERMISSIONS,
  CertificateTypeCategory.OTHERS
];

/** Icons / title keys for section headings when the rendered category changes (not persisted). */
export const CERTIFICATE_CATALOG_SECTION_META: Record<
  CertificateTypeCategory,
  { icon: string; titleKey: string }
> = {
  [CertificateTypeCategory.CERTIFICATE]: { icon: '📄', titleKey: 'CERTIFICATE.SECTION.CERTIFICATES' },
  [CertificateTypeCategory.REGISTRATION]: { icon: '📋', titleKey: 'CERTIFICATE.SECTION.REGISTRATION' },
  [CertificateTypeCategory.PERMISSIONS]: { icon: '📜', titleKey: 'CERTIFICATE.SECTION.LICENSE' },
  [CertificateTypeCategory.OTHERS]: { icon: '📌', titleKey: 'CERTIFICATE.SECTION.OTHER' }
};

/**
 * Mr/En copy from API: trimmed English when UI is English (if present), else trimmed Marathi,
 * else {@code whenEmpty}.
 */
function pickLocalizedString(
  lang: SupportedLang,
  mr: string | null | undefined,
  en: string | null | undefined,
  whenEmpty: string | null = null
): string | null {
  if (lang === 'en') {
    const trimmedEn = en?.trim();
    if (trimmedEn) {
      return trimmedEn;
    }
  }
  const trimmedMr = mr?.trim();
  if (trimmedMr) {
    return trimmedMr;
  }
  return whenEmpty;
}

/** Display title for a catalog type row or DTO (same fields as API). */
export function certificateCatalogDisplayName(
  row: Pick<CertificateTypeDto, 'code' | 'nameMr' | 'nameEn'>,
  lang: SupportedLang
): string {
  return pickLocalizedString(lang, row.nameMr, row.nameEn, row.code) ?? row.code;
}

/** Display description for a catalog type row or DTO. */
export function certificateCatalogDisplayDescription(
  row: Pick<CertificateTypeDto, 'descriptionMr' | 'descriptionEn'>,
  lang: SupportedLang
): string {
  return pickLocalizedString(lang, row.descriptionMr, row.descriptionEn, '') ?? '';
}

/** Display heading above applicant/details block from API {@code extra_fields_section_title_*}. */
export function certificateCatalogExtraSectionTitle(
  row: Pick<CertificateTypeDto, 'extraFieldsSectionTitleMr' | 'extraFieldsSectionTitleEn'>,
  lang: SupportedLang
): string | null {
  return pickLocalizedString(lang, row.extraFieldsSectionTitleMr, row.extraFieldsSectionTitleEn);
}

export function certificateShowsCatalogDefaultVersusTenantFee(
  row: Pick<CertificateTypeDto, 'tenantCertificateTypeConfig' | 'defaultFeeAmount' | 'feeAmount'>
): boolean {
  if (row.tenantCertificateTypeConfig == null) {
    return false;
  }
  return Number(row.defaultFeeAmount) !== Number(row.feeAmount);
}

/** Label / placeholder / help for one dynamic certificate field (API Mr + optional En). */
export function certificateTypeFieldLabel(field: CertificateTypeFieldDto, lang: SupportedLang): string {
  return pickLocalizedString(lang, field.labelMr, field.labelEn, field.fieldKey) ?? field.fieldKey;
}

export function certificateTypeFieldPlaceholder(
  field: CertificateTypeFieldDto,
  lang: SupportedLang
): string {
  return pickLocalizedString(lang, field.placeholderMr, field.placeholderEn, '') ?? '';
}

export function certificateTypeFieldHelpText(
  field: CertificateTypeFieldDto,
  lang: SupportedLang
): string | null {
  return pickLocalizedString(lang, field.helpTextMr, field.helpTextEn);
}

export interface CertificateTypeFieldSelectOption {
  value: string;
  label: string;
}

/** SELECT {@code optionsJson}: {@code [{ value, label_mr, label_en? }]}. */
export function certificateTypeFieldSelectOptions(
  field: CertificateTypeFieldDto,
  lang: SupportedLang
): CertificateTypeFieldSelectOption[] {
  const raw = field.optionsJson;
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: CertificateTypeFieldSelectOption[] = [];
  for (const item of raw) {
    if (item == null || typeof item !== 'object') {
      continue;
    }
    const o = item as Record<string, unknown>;
    const value = String(o['value'] ?? '').trim();
    if (!value) {
      continue;
    }
    const lmRaw = o['label_mr'] ?? o['labelMr'];
    const leRaw = o['label_en'] ?? o['labelEn'];
    const lm = typeof lmRaw === 'string' ? lmRaw : undefined;
    const le = typeof leRaw === 'string' ? leRaw : undefined;
    const label = pickLocalizedString(lang, lm, le, value) ?? value;
    out.push({ value, label });
  }
  return out;
}

/** Field keys for FILE-type dynamic fields (upload hints, etc.). */
export function certificateTypeFileFieldKeys(dto: Pick<CertificateTypeDto, 'extraFields'>): string[] {
  const extras = dto.extraFields ?? [];
  return extras
    .filter((field) => field.dataType === 'FILE')
    .map((field) => field.fieldKey);
}

/**
 * Turns raw {@code GET /certificate-types} payloads into a single list ready for the catalog UI.
 *
 * 1. **Filter:** Drops inactive rows ({@code active} / {@code isActive} false).
 * 2. **Sort:** Groups by category in UI order (Certificate → Registration → Permissions → Other), then {@code sortOrder}.
 *    Unknown categories are bucketed under {@code OTHERS}.
 * 3. **Normalize:** Trims {@code code}, {@code estimatedDaysTxt}; default {@code nameMr}; category fallback {@code icon};
 *    omits empty categories. Returns new objects (safe for change detection).
 */
export function sortAndFilterCertificateTypesForCatalog(types: CertificateTypeDto[]): CertificateTypeDto[] {
  const activeOnly = types.filter((t) => t.active !== false && t.isActive !== false);
  const byCategory = new Map<CertificateTypeCategory, CertificateTypeDto[]>();
  for (const c of CERTIFICATE_CATALOG_CATEGORY_ORDER) {
    byCategory.set(c, []);
  }
  for (const t of activeOnly) {
    (byCategory.get(t.category) ?? byCategory.get(CertificateTypeCategory.OTHERS)!).push(t);
  }
  for (const list of byCategory.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const rows: CertificateTypeDto[] = [];
  for (const cat of CERTIFICATE_CATALOG_CATEGORY_ORDER) {
    const list = byCategory.get(cat) ?? [];
    if (list.length === 0) {
      continue;
    }
    const meta = CERTIFICATE_CATALOG_SECTION_META[cat];
    for (const dto of list) {
      const rowIcon = dto.icon?.trim() || meta.icon;
      const extras = dto.extraFields ?? [];
      rows.push({
        ...dto,
        code: dto.code.trim(),
        category: dto.category,
        nameMr: dto.nameMr ?? '',
        estimatedDaysTxt: dto.estimatedDaysTxt?.trim() || null,
        tenantCertificateTypeConfig: dto.tenantCertificateTypeConfig ?? null,
        icon: rowIcon,
        extraFields: extras
      });
    }
  }
  return rows;
}
