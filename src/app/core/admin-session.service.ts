import { Injectable } from '@angular/core';

export interface AdminSessionUser {
  id: string;
  role: string;
  firstName: string;
  lastName: string;
}

const ADMIN_SESSION_KEY = 'smart-gp.admin-user';

@Injectable({ providedIn: 'root' })
export class AdminSessionService {
  private get storage() {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  }

  set(user: AdminSessionUser): void {
    this.storage?.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
  }

  get(): AdminSessionUser | null {
    const raw = this.storage?.getItem(ADMIN_SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<AdminSessionUser>;
      if (!parsed.id || !parsed.role) {
        return null;
      }
      return {
        id: parsed.id,
        role: parsed.role,
        firstName: parsed.firstName ?? '',
        lastName: parsed.lastName ?? ''
      };
    } catch {
      return null;
    }
  }

  clear(): void {
    this.storage?.removeItem(ADMIN_SESSION_KEY);
  }
}
