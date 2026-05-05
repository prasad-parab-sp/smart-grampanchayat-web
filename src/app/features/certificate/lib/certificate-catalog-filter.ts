import type { CertificateTypeDto } from '../../../core/certificate-type.models';
import { CertificateFilterPreset } from '../data/certificate-filters.data';
import type { SupportedLang } from '../../../i18n/i18n.service';
import {
  certificateCatalogDisplayDescription,
  certificateCatalogDisplayName
} from './certificate-api-mapper';

/** Resolve preset once; derive identifier/category sets (same rules as before per field). */
function filterSetsForPreset(
  presets: CertificateFilterPreset[],
  activeFilterId: string
): {
  allowedIdentifiers: Set<string> | null;
  allowedCategories: Set<string> | null;
} {
  const preset = presets.find((p) => p.id === activeFilterId);
  if (!preset || preset.id === 'all') {
    return { allowedIdentifiers: null, allowedCategories: null };
  }
  const ids = [...(preset.codes ?? []), ...(preset.nameKeys ?? [])].filter(Boolean);
  const allowedIdentifiers = ids.length === 0 ? null : new Set(ids);
  const allowedCategories =
    preset.categories?.length ? new Set(preset.categories) : null;
  return { allowedIdentifiers, allowedCategories };
}

function certificateItemMatchesFilterAndSearch(
  row: CertificateTypeDto,
  allowedIdentifiers: Set<string> | null,
  allowedCategories: Set<string> | null,
  searchQuery: string,
  lang: SupportedLang
): boolean {
  if (allowedIdentifiers && !allowedIdentifiers.has(row.code)) {
    return false;
  }
  if (allowedCategories) {
    if (!row.category || !allowedCategories.has(row.category)) {
      return false;
    }
  }
  const q = searchQuery.trim().toLowerCase();
  if (!q) {
    return true;
  }
  const n = certificateCatalogDisplayName(row, lang).toLowerCase();
  const d = certificateCatalogDisplayDescription(row, lang).toLowerCase();
  return n.includes(q) || d.includes(q);
}

/** Filters flat catalog rows (category order already applied by {@link sortAndFilterCertificateTypesForCatalog}). */
export function buildCertificateDisplayRows(
  rows: CertificateTypeDto[],
  presets: CertificateFilterPreset[],
  activeFilterId: string,
  searchQuery: string,
  lang: SupportedLang
): CertificateTypeDto[] {
  const { allowedIdentifiers, allowedCategories } = filterSetsForPreset(presets, activeFilterId);
  return rows.filter((r) =>
    certificateItemMatchesFilterAndSearch(r, allowedIdentifiers, allowedCategories, searchQuery, lang)
  );
}
