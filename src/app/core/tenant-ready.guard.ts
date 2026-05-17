import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { isPlatformAdminRoute } from './platform-admin-routes';
import { TenantService } from './tenant.service';

/** When tenant bootstrap failed, steer users to `/tenant-error` instead of login/home. */
export const tenantReadyGuard: CanActivateFn = async () => {
  const tenant = inject(TenantService);
  const router = inject(Router);

  if (typeof window !== 'undefined' && isPlatformAdminRoute(window.location.pathname)) {
    return true;
  }

  await tenant.ensureTenantLoaded();

  if (tenant.loadState === 'error') {
    return router.createUrlTree(['/tenant-error']);
  }
  return true;
};
