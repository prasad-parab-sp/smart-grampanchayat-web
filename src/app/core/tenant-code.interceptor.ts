import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { isPlatformAdminRoute } from './platform-admin-routes';
import { TENANT_SESSION_STORAGE_KEY } from './tenant-session.store';

/** Must match backend {@code TenantCodeHeaderFilter.HEADER_TENANT_CODE}. */
export const HTTP_HEADER_TENANT_CODE = 'X-Tenant-Code';

/**
 * Tenant code synced with {@link TENANT_SESSION_STORAGE_KEY} (`smart-gp.tenant`).
 * Read synchronously (no `inject()`) so the interceptor never participates in a DI bootstrap cycle
 * with {@link TenantService} during {@code APP_INITIALIZER}.
 */
function tenantCodeFromSessionOrEnv(): string {
  try {
    if (typeof sessionStorage !== 'undefined') {
      const raw = sessionStorage.getItem(TENANT_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { tenantCode?: string };
        const c = parsed.tenantCode?.trim();
        if (c) {
          return c;
        }
      }
    }
  } catch {
    // ignore invalid JSON / storage errors
  }
  return environment.tenantCode.trim();
}

/** Master platform APIs and tenant provisioning — no district shard header. */
function omitsTenantHeader(req: { method: string; url: string }, apiBase: string): boolean {
  if (!req.url.startsWith(apiBase)) {
    return false;
  }
  const path = req.url.slice(apiBase.length).split('?')[0];
  if (path.startsWith('/api/platform/')) {
    return true;
  }
  return req.method === 'POST' && path === '/api/tenants';
}

/** Adds tenant code header for outbound API URLs under configured {@code apiBaseUrl}. */
export const tenantCodeInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBase = (environment.apiBaseUrl ?? '').trim();
  if (
    typeof window !== 'undefined' &&
    isPlatformAdminRoute(window.location.pathname)
  ) {
    return next(req);
  }
  /** Empty base would make `startsWith('')` true for every URL; never widen the header blindly. */
  if (apiBase.length === 0 || omitsTenantHeader(req, apiBase)) {
    return next(req);
  }
  const code = tenantCodeFromSessionOrEnv().trim();
  if (!code || !req.url.startsWith(apiBase)) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { [HTTP_HEADER_TENANT_CODE]: code } }));
};
