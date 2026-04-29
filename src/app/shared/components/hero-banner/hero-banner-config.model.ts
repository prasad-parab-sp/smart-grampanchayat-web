/**
 * Minimal config for the hero (title, taluka·district line, logo, banner). Filled from {@link Tenant} + i18n.
 */
export interface HeroBannerConfig {
  displayNameMr: string;
  displayNameEn: string;
  talukaMr: string;
  talukaEn: string;
  /** From shard `districtNameMr` */
  districtDisplayMr: string;
  /** From shard `districtNameEn` */
  districtDisplayEn: string;
  logoUrl: string | null;
  imageUrl: string | null;
}
