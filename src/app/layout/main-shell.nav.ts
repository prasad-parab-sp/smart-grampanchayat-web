/** Primary bottom navigation — single source of truth for shell + router URLs. */

export interface MainShellNavItem {
  link: string;
  icon: string;
  labelKey: string;
  /** Use exact: true for `/home` so it does not stay active on every child path. */
  exact?: boolean;
}

export const MAIN_SHELL_NAV: MainShellNavItem[] = [
  { link: '/home', icon: '🏠', labelKey: 'HOME.NAV_HOME', exact: true },
  { link: '/kar', icon: '💰', labelKey: 'HOME.NAV_KAR' },
  { link: '/certificate', icon: '📋', labelKey: 'HOME.NAV_CERTIFICATE' },
  { link: '/notice', icon: '📢', labelKey: 'HOME.NAV_NOTICE' },
  { link: '/profile', icon: '👤', labelKey: 'HOME.NAV_PROFILE' }
];
