import { Injectable } from '@angular/core';

import { Tenant } from './tenant.models';

/** One entry per tab; overwritten on each successful tenant load. */
export const TENANT_SESSION_STORAGE_KEY = 'smart-gp.tenant';

@Injectable({ providedIn: 'root' })
export class TenantSessionStore {
  private get storage() {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  }

  /**
   * Last saved tenant JSON for this tab, or `null` if missing or invalid.
   */
  getTenant(): Tenant | null {
    const raw = this.storage?.getItem(TENANT_SESSION_STORAGE_KEY);
    if (raw == null) {
      return null;
    }
    try {
      return JSON.parse(raw) as Tenant;
    } catch {
      this.storage?.removeItem(TENANT_SESSION_STORAGE_KEY);
      return null;
    }
  }

  /**
   * Persists the tenant under a fixed session key (no per-`tenantCode` key; session is tab-scoped anyway).
   */
  save(data: Tenant): void {
    this.storage?.setItem(TENANT_SESSION_STORAGE_KEY, JSON.stringify(data));
  }

  /** Removes cached tenant (e.g. after a failed load so the UI does not show stale data). */
  clear(): void {
    this.storage?.removeItem(TENANT_SESSION_STORAGE_KEY);
  }
}
