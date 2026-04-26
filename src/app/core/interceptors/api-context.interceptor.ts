import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Cross-cutting HTTP behavior for **app API** calls only (not `/assets`, not third-party URLs).
 *
 * Why interceptors (senior UI perspective):
 * - **One place** for correlation IDs, default tenant hints, auth tokens later — avoids
 *   duplicating header logic in every `HttpClient.get/post`.
 * - **Consistency**: every `/api/**` call gets the same tracing / tenancy contract the backend expects.
 * - **Easier refactors**: swap header names or add `Authorization` once, not in N services.
 * - **Pitfall**: keep interceptors **thin** (headers, logging); heavy business rules belong in services.
 * - **Scope**: we intentionally skip non-API requests so i18n JSON and static assets are untouched.
 */
export const apiContextInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isAppApiRequest(req.url)) {
    return next(req);
  }

  let headers = req.headers;
  if (!headers.has('X-Correlation-Id')) {
    headers = headers.set('X-Correlation-Id', crypto.randomUUID());
  }
  if (!headers.has('X-Tenant-Code') && environment.defaultTenantName) {
    headers = headers.set('X-Tenant-Code', environment.defaultTenantName);
  }

  return next(req.clone({ headers }));
};

function isAppApiRequest(url: string): boolean {
  if (url.startsWith('/api/')) {
    return true;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url).pathname.startsWith('/api/');
    } catch {
      return false;
    }
  }
  return false;
}
