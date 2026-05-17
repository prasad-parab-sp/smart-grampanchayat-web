import type { AdminSessionUser } from './admin-session.service';

/** Roles allowed to open the villager / citizen register (`/admin/citizens`). */
const CITIZEN_REGISTER_ROLES = new Set(['GRAMSEVAK', 'SARPANCH']);

export function normalizeAdminRole(role: string | null | undefined): string {
  return (role ?? '').trim().toUpperCase();
}

export function canManageCitizenRegister(admin: AdminSessionUser | null | undefined): boolean {
  if (!admin) {
    return false;
  }
  const stored = normalizeAdminRole(admin.storedRole);
  const effective = normalizeAdminRole(admin.role);
  return CITIZEN_REGISTER_ROLES.has(stored) || CITIZEN_REGISTER_ROLES.has(effective);
}

export function canManageCitizenRegisterByStoredRole(storedRole: string | null | undefined): boolean {
  return CITIZEN_REGISTER_ROLES.has(normalizeAdminRole(storedRole));
}
