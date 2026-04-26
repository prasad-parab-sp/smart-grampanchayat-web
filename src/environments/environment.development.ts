/**
 * Local development (default for `ng serve` in angular.json).
 *
 * - `apiBaseUrl: ''` — Browser only talks to :4200. DevTools **Network** shows
 *   `http://localhost:4200/api/...` (the proxy to Spring is server-side; check the **terminal**
 *   where `ng serve` runs for `[HPM] ... proxy` / forwarded lines).
 * - `apiBaseUrl: 'http://localhost:8080'` — **Network** will show a direct call to :8080
 *   (Spring must allow CORS for :4200 — already set in the API). Use this when you want
 *   to see the “real” URL in the browser.
 */
export const environment = {
  production: false,
  apiBaseUrl: '',
  defaultTenantName: 'ADALI',
};
