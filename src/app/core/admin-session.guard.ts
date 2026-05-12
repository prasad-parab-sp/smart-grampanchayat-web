import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AdminSessionService } from './admin-session.service';

export const adminSessionGuard: CanActivateFn = () => {
  const adminSession = inject(AdminSessionService);
  if (adminSession.get()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login']);
};
