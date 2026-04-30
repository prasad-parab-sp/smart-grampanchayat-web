import {
  CertificateCatalogRow,
  CertificateListItem,
  isCertificateSectionHeader
} from '../data/certificate-catalog.data';
import { CertificateFilterPreset } from '../data/certificate-filters.data';

export function nameKeySetForFilter(
  presets: CertificateFilterPreset[],
  activeFilterId: string
): Set<string> | null {
  const preset = presets.find((p) => p.id === activeFilterId);
  if (!preset || preset.id === 'all' || !preset.nameKeys.length) {
    return null;
  }
  return new Set(preset.nameKeys);
}

export function certificateItemMatchesFilterAndSearch(
  row: CertificateListItem,
  allowedNameKeys: Set<string> | null,
  searchQuery: string,
  translate: (key: string) => string
): boolean {
  if (allowedNameKeys && !allowedNameKeys.has(row.nameKey)) {
    return false;
  }
  const q = searchQuery.trim().toLowerCase();
  if (!q) {
    return true;
  }
  const n = translate(row.nameKey).toLowerCase();
  const d = translate(row.descKey).toLowerCase();
  return n.includes(q) || d.includes(q);
}

export function buildCertificateDisplayRows(
  rows: CertificateCatalogRow[],
  presets: CertificateFilterPreset[],
  activeFilterId: string,
  searchQuery: string,
  translate: (key: string) => string
): CertificateCatalogRow[] {
  const allowed = nameKeySetForFilter(presets, activeFilterId);
  const res: CertificateCatalogRow[] = [];
  let group: CertificateCatalogRow[] = [];

  const flush = () => {
    if (group.length === 0) {
      return;
    }
    const h = group[0];
    if (!isCertificateSectionHeader(h)) {
      group = [];
      return;
    }
    const items = group
      .slice(1)
      .filter((r) =>
        certificateItemMatchesFilterAndSearch(r as CertificateListItem, allowed, searchQuery, translate)
      ) as CertificateListItem[];
    if (items.length > 0) {
      res.push(h, ...items);
    }
    group = [];
  };

  for (const r of rows) {
    if (isCertificateSectionHeader(r)) {
      flush();
      group = [r];
    } else {
      group.push(r);
    }
  }
  flush();
  return res;
}
