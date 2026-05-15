import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AdminSessionService } from './admin-session.service';

/** GP Admin certificate-type management routes. */
export const gpAdminGuard: CanActivateFn = () => {
  const admin = inject(AdminSessionService).get();
  if (admin?.storedRole === 'GP_ADMIN') {
    return true;
  }
  return inject(Router).createUrlTree(['/admin/home']);
};

/** Staff admin routes (formats, certificate register, etc.) — not for GP Admin. */
export const nonGpAdminGuard: CanActivateFn = () => {
  const admin = inject(AdminSessionService).get();
  if (!admin) {
    return inject(Router).createUrlTree(['/login']);
  }
  if (admin.storedRole === 'GP_ADMIN') {
    return inject(Router).createUrlTree(['/admin/home']);
  }
  return true;
};
