/**
 * Minimal slice of {@link TenantDto} for the hero — only fields needed for title, location line, logo, banner.
 */
export interface HeroBannerConfig {
  displayNameMr: string;
  displayNameEn: string;
  talukaMr: string;
  talukaEn: string;
  /** From `district.displayNameMr` / fallback `district.name` */
  districtDisplayMr: string;
  /** From `district.displayNameEn` / fallback `district.name` */
  districtDisplayEn: string;
  logoUrl: string | null;
  imageUrl: string | null;
}
