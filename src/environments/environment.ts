/**
 * Production build. Replace or inject API URL per deployment.
 */
export const environment = {
  production: true,
  /** No trailing slash. Use same host as API in prod, or your gateway URL. */
  apiBaseUrl: '',
  /** Default tenant to resolve (code, name, or display name per backend). */
  defaultTenantName: 'adali',
};
