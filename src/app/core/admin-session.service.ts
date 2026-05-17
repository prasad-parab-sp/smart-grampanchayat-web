import { Injectable } from '@angular/core';

export interface AdminSessionUser {
  id: string;
  /** Effective role (e.g. acting Sarpanch) — for display. */
  role: string;
  /** Stored DB role — use for permission checks (e.g. only Gramsevak may approve). */
  storedRole: string;
  firstName: string;
  lastName: string;
  /** Mobile or email as entered at login — for re-auth on sensitive actions. */
  loginIdentifier: string;
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
      if (!parsed.id) {
        return null;
      }
      const stored = (parsed.storedRole ?? parsed.role ?? '').trim();
      const effective = (parsed.role ?? parsed.storedRole ?? '').trim();
      if (!stored) {
        return null;
      }
      return {
        id: parsed.id,
        role: effective,
        storedRole: stored,
        firstName: parsed.firstName ?? '',
        lastName: parsed.lastName ?? '',
        loginIdentifier: (parsed.loginIdentifier ?? '').trim()
      };
    } catch {
      return null;
    }
  }

  clear(): void {
    this.storage?.removeItem(ADMIN_SESSION_KEY);
  }
}
