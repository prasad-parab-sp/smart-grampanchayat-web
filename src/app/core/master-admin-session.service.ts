import { Injectable } from '@angular/core';

export interface MasterAdminSessionUser {
  id: string;
  mobile: string;
  displayName: string;
  role: 'super_admin' | 'platform_admin';
}

const MASTER_ADMIN_SESSION_KEY = 'smart-gp.master-admin';

@Injectable({ providedIn: 'root' })
export class MasterAdminSessionService {
  private get storage() {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  }

  set(user: MasterAdminSessionUser): void {
    this.storage?.setItem(MASTER_ADMIN_SESSION_KEY, JSON.stringify(user));
  }

  get(): MasterAdminSessionUser | null {
    const raw = this.storage?.getItem(MASTER_ADMIN_SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<MasterAdminSessionUser>;
      const mobile = (parsed.mobile ?? '').trim();
      if (!parsed.id || !mobile) {
        return null;
      }
      return {
        id: parsed.id,
        mobile,
        displayName: (parsed.displayName ?? mobile).trim(),
        role: parsed.role === 'super_admin' ? 'super_admin' : 'platform_admin'
      };
    } catch {
      return null;
    }
  }

  clear(): void {
    this.storage?.removeItem(MASTER_ADMIN_SESSION_KEY);
  }
}
