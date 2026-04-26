import { TenantSessionStore } from '../../../core/tenant-session.store';
import { DistrictDto, TenantDto } from '../../../core/tenant.models';
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

const districtLabel = (d: DistrictDto, lang: 'mr' | 'en'): string => {
  if (lang === 'en') {
    return (d.displayNameEn?.trim() || d.name).trim();
  }
  return (d.displayNameMr?.trim() || d.name).trim();
};

export function heroBannerConfigFromTenant(t: TenantDto): HeroBannerConfig {
  const d = t.district;
  return {
    displayNameMr: (t.displayNameMr?.trim() || t.name).trim(),
    displayNameEn: (t.displayNameEn?.trim() || t.name).trim(),
    talukaMr: (t.talukaMr ?? t.talukaEn ?? '').trim(),
    talukaEn: (t.talukaEn ?? t.talukaMr ?? '').trim(),
    districtDisplayMr: d ? districtLabel(d, 'mr') : '',
    districtDisplayEn: d ? districtLabel(d, 'en') : '',
    logoUrl: t.logoUrl?.trim() ? t.logoUrl.trim() : null,
    imageUrl: t.imageUrl?.trim() ? t.imageUrl.trim() : null
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
