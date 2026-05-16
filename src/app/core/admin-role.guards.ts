import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AdminSessionService } from './admin-session.service';

/** GP Admin or System Admin — certificate type catalog writes. */
export const gpAdminGuard: CanActivateFn = () => {
  const admin = inject(AdminSessionService).get();
  const role = admin?.storedRole;
  if (role === 'GP_ADMIN' || role === 'SYS_ADMIN') {
    return true;
  }
  return inject(Router).createUrlTree(['/admin/home']);
};

/** Tax type catalog — GP Admin, Gramsevak, or System Admin. */
export const taxCatalogGuard: CanActivateFn = () => {
  const admin = inject(AdminSessionService).get();
  const role = admin?.storedRole;
  if (role === 'GP_ADMIN' || role === 'GRAMSEVAK' || role === 'SYS_ADMIN') {
    return true;
  }
  return inject(Router).createUrlTree(['/admin/home']);
};

/** Citizen tax demands — Gramsevak, Operator, or System Admin (not GP Admin). */
export const taxStaffGuard: CanActivateFn = () => {
  const admin = inject(AdminSessionService).get();
  if (!admin) {
    return inject(Router).createUrlTree(['/login']);
  }
  const role = admin.storedRole;
  if (role === 'GRAMSEVAK' || role === 'OPERATOR' || role === 'SYS_ADMIN') {
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
