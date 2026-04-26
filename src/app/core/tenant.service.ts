import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { TenantDto } from './tenant.models';
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
  tenant: TenantDto | null = null;
  loadState: TenantLoadState = 'idle';
  activeTenantCode: string | null = null;


  /**
   * Called from `APP_INITIALIZER`. Fetches tenant from the API, then saves under
   * `sessionStorage` key `smart-gp.tenant`.
   */
  loadOnStartup(): Promise<void> {
    const tenantCode = this.resolveTenantCode();
    this.activeTenantCode = tenantCode;
    this.loadState = 'loading';

    const params = new HttpParams().set('tenantCode', tenantCode);
    return firstValueFrom(
      this.http
        .get<TenantDto>(`${environment.apiBaseUrl}/api/tenants`, { params })
        .pipe(
          catchError(() => of(null as TenantDto | null))
        )
    ).then((t) => {
      if (t) {
        this.tenant = t;
        this.loadState = 'ok';
        this.sessionStore.save(t);
        this.activeTenantCode = t.tenantCode;
      } else {
        this.tenant = null;
        this.loadState = 'error';
      }
    });
  }


  /**
 * Resolves the tenant id for API calls. For now, only the build `environment` value.
 * When multi-tenancy is implemented, extend this (e.g. query string, path, or host) and
 * keep `environment.tenantCode` as the fallback.
 */
public  resolveTenantCode(): string {
  return environment.tenantCode;
}
}
