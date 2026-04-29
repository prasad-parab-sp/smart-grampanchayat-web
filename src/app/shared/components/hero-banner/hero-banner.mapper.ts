import { TenantSessionStore } from '../../../core/tenant-session.store';
import { Tenant } from '../../../core/tenant.models';
import { HeroBannerConfig } from './hero-banner-config.model';

export const DEFAULT_HERO_BANNER_CONFIG: HeroBannerConfig = {
  displayNameMr: 'ग्रामपंचायत',
  displayNameEn: 'Gram Panchayat',
  talukaMr: '',
  talukaEn: '',
  districtDisplayMr: '',
  districtDisplayEn: '',
  logoUrl: null,
  imageUrl: null
};

export function gpTitleNameForLang(cfg: HeroBannerConfig, uiLang: 'mr' | 'en'): string {
  const v = uiLang === 'en' ? cfg.displayNameEn : cfg.displayNameMr;
  return v.trim();
}

export function heroBannerConfigFromTenant(t: Tenant): HeroBannerConfig {
  const nameMr = (t.displayNameMr?.trim() || t.name).trim();
  const nameEn = (t.displayNameEn?.trim() || t.name).trim();
  return {
    displayNameMr: nameMr,
    displayNameEn: nameEn,
    talukaMr: (t.talukaMr ?? '').trim(),
    talukaEn: (t.talukaEn ?? '').trim(),
    districtDisplayMr: (t.districtNameMr ?? '').trim(),
    districtDisplayEn: (t.districtNameEn ?? '').trim(),
    logoUrl: t.logoUrl ?? null,
    imageUrl: t.imageUrl ?? null
  };
}

const BULLET = ' \u2022 ';

/**
 * e.g. `ता. … • जि. …` (MR) or `T. … • D. …` (EN)
 */
export function formatTalukaDistrictLine(cfg: HeroBannerConfig, uiLang: 'mr' | 'en'): string {
  const en = uiLang === 'en';
  const tal = (en ? cfg.talukaEn : cfg.talukaMr).trim();
  const dist = (en ? cfg.districtDisplayEn : cfg.districtDisplayMr).trim();
  if (!tal && !dist) {
    return '';
  }
  if (en) {
    if (tal && dist) {
      return `T. ${tal}${BULLET}D. ${dist}`;
    }
    return tal ? `T. ${tal}` : `D. ${dist}`;
  }
  if (tal && dist) {
    return `ता. ${tal}${BULLET}जि. ${dist}`;
  }
  return tal ? `ता. ${tal}` : `जि. ${dist}`;
}

/** Cached tenant in session, or default labels when not yet loaded. */
export function heroBannerConfigFromSession(session: TenantSessionStore): HeroBannerConfig {
  const t = session.getTenant();
  return t != null ? heroBannerConfigFromTenant(t) : { ...DEFAULT_HERO_BANNER_CONFIG };
}
