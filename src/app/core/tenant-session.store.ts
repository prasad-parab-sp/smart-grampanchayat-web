import { Injectable } from '@angular/core';

import { TenantDto } from './tenant.models';

/** One entry per tab; overwritten on each successful tenant load. */
const TENANT_SESSION_KEY = 'smart-gp.tenant';

@Injectable({ providedIn: 'root' })
export class TenantSessionStore {
  private get storage() {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  }

  /**
   * Last saved tenant JSON for this tab, or `null` if missing or invalid.
   */
  getTenant(): TenantDto | null {
    const raw = this.storage?.getItem(TENANT_SESSION_KEY);
    if (raw == null) {
      return null;
    }
    try {
      return JSON.parse(raw) as TenantDto;
    } catch {
      this.storage?.removeItem(TENANT_SESSION_KEY);
      return null;
    }
  }

  /**
   * Persists the tenant under a fixed session key (no per-`tenantCode` key; session is tab-scoped anyway).
   */
  save(data: TenantDto): void {
    this.storage?.setItem(TENANT_SESSION_KEY, JSON.stringify(data));
  }
}
