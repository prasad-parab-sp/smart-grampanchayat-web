import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { MasterAdminSessionService } from './master-admin-session.service';

/** Platform console routes — requires master admin session. */
export const platformAdminSessionGuard: CanActivateFn = () => {
  const session = inject(MasterAdminSessionService);
  const router = inject(Router);
  if (session.get()) {
    return true;
  }
  return router.createUrlTree(['/admin/login']);
};

/** `/admin/login` — redirect to console when already signed in. */
export const platformAdminGuestGuard: CanActivateFn = () => {
  const session = inject(MasterAdminSessionService);
  const router = inject(Router);
  if (session.get()) {
    return router.createUrlTree(['/admin/platform/home']);
  }
  return true;
};
