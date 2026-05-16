/**
 * Admin home quick actions by {@link AdminSessionUser.storedRole}.
 * Keep routes aligned with {@link app.routes.ts} guards (e.g. GP_ADMIN / SYS_ADMIN vs nonGpAdminGuard).
 */

export interface AdminQuickAction {
  icon: string;
  titleKey: string;
  subtitleKey: string;
  route?: string;
}

const STAFF_FULL_QUICK_ACTIONS: AdminQuickAction[] = [
  {
    icon: '🏠',
    titleKey: 'ADMIN_HOME.ACTION_HOUSE_TAX',
    subtitleKey: 'ADMIN_HOME.ACTION_HOUSE_TAX_SUB',
    route: '/admin/citizen-taxes'
  },
  {
    icon: '💧',
    titleKey: 'ADMIN_HOME.ACTION_WATER',
    subtitleKey: 'ADMIN_HOME.ACTION_WATER_SUB',
    route: '/admin/tax-types'
  },
  {
    icon: '📢',
    titleKey: 'ADMIN_HOME.ACTION_NOTICE',
    subtitleKey: 'ADMIN_HOME.ACTION_NOTICE_SUB',
    route: '/admin/notices'
  },
  {
    icon: '📄',
    titleKey: 'ADMIN_HOME.ACTION_FORMAT',
    subtitleKey: 'ADMIN_HOME.ACTION_FORMAT_SUB',
    route: '/admin/formats'
  },
  {
    icon: '📑',
    titleKey: 'ADMIN_HOME.ACTION_CERT_REGISTRY_TITLE',
    subtitleKey: 'ADMIN_HOME.ACTION_CERT_REGISTRY_SUB',
    route: '/admin/certificate-applications'
  },
  { icon: '📱', titleKey: 'ADMIN_HOME.ACTION_WHATSAPP', subtitleKey: 'ADMIN_HOME.ACTION_WHATSAPP_SUB' },
  { icon: '⚙️', titleKey: 'ADMIN_HOME.ACTION_SETTINGS', subtitleKey: 'ADMIN_HOME.ACTION_SETTINGS_SUB' },
  { icon: '🚜', titleKey: 'ADMIN_HOME.ACTION_MACHINERY', subtitleKey: 'ADMIN_HOME.ACTION_MACHINERY_SUB' },
  { icon: '🏗️', titleKey: 'ADMIN_HOME.ACTION_FUNDS', subtitleKey: 'ADMIN_HOME.ACTION_FUNDS_SUB' },
  { icon: '🏦', titleKey: 'ADMIN_HOME.ACTION_BANK', subtitleKey: 'ADMIN_HOME.ACTION_BANK_SUB' },
  { icon: '👥', titleKey: 'ADMIN_HOME.ACTION_VILLAGERS', subtitleKey: 'ADMIN_HOME.ACTION_VILLAGERS_SUB' },
  { icon: '📊', titleKey: 'ADMIN_HOME.ACTION_REPORT', subtitleKey: 'ADMIN_HOME.ACTION_REPORT_SUB' },
  { icon: '🔔', titleKey: 'ADMIN_HOME.ACTION_MEETING', subtitleKey: 'ADMIN_HOME.ACTION_MEETING_SUB' }
];

/** Sarpanch: oversight / governance — fewer operational shortcuts. */
const SARPANCH_QUICK_ACTIONS: AdminQuickAction[] = [
  {
    icon: '📢',
    titleKey: 'ADMIN_HOME.ACTION_NOTICE',
    subtitleKey: 'ADMIN_HOME.ACTION_NOTICE_SUB',
    route: '/admin/notices'
  },
  {
    icon: '📄',
    titleKey: 'ADMIN_HOME.ACTION_FORMAT',
    subtitleKey: 'ADMIN_HOME.ACTION_FORMAT_SUB',
    route: '/admin/formats'
  },
  {
    icon: '📑',
    titleKey: 'ADMIN_HOME.ACTION_CERT_REGISTRY_TITLE',
    subtitleKey: 'ADMIN_HOME.ACTION_CERT_REGISTRY_SUB',
    route: '/admin/certificate-applications'
  },
  { icon: '📊', titleKey: 'ADMIN_HOME.ACTION_REPORT', subtitleKey: 'ADMIN_HOME.ACTION_REPORT_SUB' },
  { icon: '🔔', titleKey: 'ADMIN_HOME.ACTION_MEETING', subtitleKey: 'ADMIN_HOME.ACTION_MEETING_SUB' },
  { icon: '👥', titleKey: 'ADMIN_HOME.ACTION_VILLAGERS', subtitleKey: 'ADMIN_HOME.ACTION_VILLAGERS_SUB' },
  { icon: '🏗️', titleKey: 'ADMIN_HOME.ACTION_FUNDS', subtitleKey: 'ADMIN_HOME.ACTION_FUNDS_SUB' },
  { icon: '📱', titleKey: 'ADMIN_HOME.ACTION_WHATSAPP', subtitleKey: 'ADMIN_HOME.ACTION_WHATSAPP_SUB' }
];

/** Viewer: read-oriented destinations (routes shared with staff where applicable). */
const VIEWER_QUICK_ACTIONS: AdminQuickAction[] = [
  {
    icon: '📄',
    titleKey: 'ADMIN_HOME.ACTION_FORMAT',
    subtitleKey: 'ADMIN_HOME.ACTION_FORMAT_SUB',
    route: '/admin/formats'
  },
  {
    icon: '📑',
    titleKey: 'ADMIN_HOME.ACTION_CERT_REGISTRY_TITLE',
    subtitleKey: 'ADMIN_HOME.ACTION_CERT_REGISTRY_SUB',
    route: '/admin/certificate-applications'
  },
  { icon: '📊', titleKey: 'ADMIN_HOME.ACTION_REPORT', subtitleKey: 'ADMIN_HOME.ACTION_REPORT_SUB' },
  {
    icon: '📢',
    titleKey: 'ADMIN_HOME.ACTION_NOTICE',
    subtitleKey: 'ADMIN_HOME.ACTION_NOTICE_SUB',
    route: '/admin/notices'
  }
];

const GP_ADMIN_QUICK_ACTIONS: AdminQuickAction[] = [
  {
    icon: '📋',
    titleKey: 'ADMIN_GP.ACTION_MANAGE_CERT_TYPES_TITLE',
    subtitleKey: 'ADMIN_GP.ACTION_MANAGE_CERT_TYPES_SUB',
    route: '/admin/certificate-types'
  },
  {
    icon: '💰',
    titleKey: 'ADMIN_TAX.MANAGE_TYPES_TITLE',
    subtitleKey: 'ADMIN_TAX.MANAGE_TYPES_SUB',
    route: '/admin/tax-types'
  }
];

/** Clone an array of quick actions to prevent mutation. 
 * Cloning was defensive: it returns a new array and new objects so accidental this.quickActions.push(...) 
 * or mutating a card doesn’t alter the shared const arrays used by every role that shares that list.
*/
function cloneQuickActions(rows: AdminQuickAction[]): AdminQuickAction[] {
  return rows.map((a) => ({ ...a }));
}

/**
 * @param storedRole {@link AdminSessionUser.storedRole} (database role, not acting elevation).
 */
export function resolveAdminHomeQuickActions(storedRole: string): AdminQuickAction[] {
  const role = storedRole.trim();
  switch (role) {
    case 'GP_ADMIN':
    case 'SYS_ADMIN':
      return cloneQuickActions(GP_ADMIN_QUICK_ACTIONS);
    case 'SARPANCH':
      return cloneQuickActions(SARPANCH_QUICK_ACTIONS);
    case 'VIEWER':
      return cloneQuickActions(VIEWER_QUICK_ACTIONS);
    case 'GRAMSEVAK':
    case 'OPERATOR':
      return cloneQuickActions(STAFF_FULL_QUICK_ACTIONS);
    default:
      return cloneQuickActions(STAFF_FULL_QUICK_ACTIONS);
  }
}
