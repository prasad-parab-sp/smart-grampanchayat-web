import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Tenant } from './tenant.models';
import { isPlatformAdminRoute } from './platform-admin-routes';
import { TenantSessionStore } from './tenant-session.store';

export type TenantLoadState = 'idle' | 'loading' | 'ok' | 'error';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly http = inject(HttpClient);
  private readonly sessionStore = inject(TenantSessionStore);

  /**
   * Set once in `loadOnStartup` (runs before app bootstrap). Stays constant until a full
   * page load / new host; no in-session reactivity is required.
   */
  tenant: Tenant | null = null;
  loadState: TenantLoadState = 'idle';
  activeTenantCode: string | null = null;

  private loadPromise: Promise<void> | null = null;

  /**
   * Called from `APP_INITIALIZER`. Skips tenant fetch on platform admin URLs.
   */
  loadOnStartup(): Promise<void> {
    if (typeof window !== 'undefined' && isPlatformAdminRoute(window.location.pathname)) {
      return Promise.resolve();
    }
    return this.ensureTenantLoaded();
  }

  /** Loads tenant for GP/citizen routes (e.g. from {@link tenantReadyGuard}). */
  ensureTenantLoaded(): Promise<void> {
    if (this.loadState === 'ok') {
      return Promise.resolve();
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }
    this.loadPromise = this.fetchTenant().finally(() => {
      this.loadPromise = null;
    });
    return this.loadPromise;
  }

  private fetchTenant(): Promise<void> {
    const tenantCode = this.resolveTenantCode();
    this.activeTenantCode = tenantCode;
    this.loadState = 'loading';

    const params = new HttpParams().set('tenantCode', tenantCode);
    return firstValueFrom(
      this.http
        .get<Tenant>(`${environment.apiBaseUrl}/api/tenants`, { params })
        .pipe(catchError(() => of(null as Tenant | null)))
    ).then((t) => {
      if (t) {
        this.tenant = t;
        this.loadState = 'ok';
        this.sessionStore.save(t);
        this.activeTenantCode = t.tenantCode;
      } else {
        this.tenant = null;
        this.loadState = 'error';
        this.sessionStore.clear();
      }
    });
  }

  /**
   * Resolves the tenant id for API calls. For now, only the build `environment` value.
   */
  resolveTenantCode(): string {
    return environment.tenantCode;
  }
}
