import {
  CertificateCatalogRow,
  CertificateCatalogTypeRow,
  isCertificateSectionRow
} from '../data/certificate-catalog.data';
import { CertificateFilterPreset } from '../data/certificate-filters.data';
import type { SupportedLang } from '../../../i18n/i18n.service';
import {
  certificateCatalogDisplayDescription,
  certificateCatalogDisplayName
} from './certificate-api-mapper';

/** Codes or legacy static name keys allowed by the active preset (API rows match `code`). */
function identifierSetForFilter(
  presets: CertificateFilterPreset[],
  activeFilterId: string
): Set<string> | null {
  const preset = presets.find((p) => p.id === activeFilterId);
  if (!preset || preset.id === 'all') {
    return null;
  }
  const ids = [...(preset.codes ?? []), ...(preset.nameKeys ?? [])].filter(Boolean);
  if (ids.length === 0) {
    return null;
  }
  return new Set(ids);
}

function categorySetForFilter(
  presets: CertificateFilterPreset[],
  activeFilterId: string
): Set<string> | null {
  const preset = presets.find((p) => p.id === activeFilterId);
  if (!preset || preset.id === 'all' || !preset.categories?.length) {
    return null;
  }
  return new Set(preset.categories);
}

function certificateItemMatchesFilterAndSearch(
  row: CertificateCatalogTypeRow,
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

export function buildCertificateDisplayRows(
  rows: CertificateCatalogRow[],
  presets: CertificateFilterPreset[],
  activeFilterId: string,
  searchQuery: string,
  lang: SupportedLang
): CertificateCatalogRow[] {
  const allowedIdentifiers = identifierSetForFilter(presets, activeFilterId);
  const allowedCategories = categorySetForFilter(presets, activeFilterId);
  const res: CertificateCatalogRow[] = [];
  let group: CertificateCatalogRow[] = [];

  const flush = () => {
    if (group.length === 0) {
      return;
    }
    const h = group[0];
    if (!isCertificateSectionRow(h)) {
      group = [];
      return;
    }
    const items = group
      .slice(1)
      .filter((r) =>
        certificateItemMatchesFilterAndSearch(
          r as CertificateCatalogTypeRow,
          allowedIdentifiers,
          allowedCategories,
          searchQuery,
          lang
        )
      ) as CertificateCatalogTypeRow[];
    if (items.length > 0) {
      res.push(h, ...items);
    }
    group = [];
  };

  for (const r of rows) {
    if (isCertificateSectionRow(r)) {
      flush();
      group = [r];
    } else {
      group.push(r);
    }
  }
  flush();
  return res;
}
