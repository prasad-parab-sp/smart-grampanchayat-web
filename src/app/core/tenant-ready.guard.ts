import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { TenantService } from './tenant.service';

/** When {@link TenantService.loadOnStartup} could not fetch tenant, steer users to `/tenant-error` instead of login/home. */
export const tenantReadyGuard: CanActivateFn = () => {
  const tenant = inject(TenantService);
  const router = inject(Router);
  if (tenant.loadState === 'error') {
    return router.createUrlTree(['/tenant-error']);
  }
  return true;
};
