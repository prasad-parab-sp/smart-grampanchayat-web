import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../environments/environment';
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

/** Adds tenant code header for outbound API URLs under configured {@code apiBaseUrl}. */
export const tenantCodeInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBase = (environment.apiBaseUrl ?? '').trim();
  /** Empty base would make `startsWith('')` true for every URL; never widen the header blindly. */
  if (apiBase.length === 0) {
    return next(req);
  }
  const code = tenantCodeFromSessionOrEnv().trim();
  if (!code || !req.url.startsWith(apiBase)) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { [HTTP_HEADER_TENANT_CODE]: code } }));
};
