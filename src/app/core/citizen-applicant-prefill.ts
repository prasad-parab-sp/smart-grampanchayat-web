import { ChangeDetectorRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { citizenFullDisplayName } from './citizen-name.util';
import { CitizenService } from './citizen.service';
import { LoggedInCitizenService } from './logged-in-citizen.service';

/**
 * Fills applicant name via {@link CitizenService.getById} using {@link LoggedInCitizenService.getCurrentLoggedInCitizenId}.
 * If the API fails, falls back to the in-memory badge when present.
 *
 * Call early in `ngOnInit`, then again inside `queueMicrotask` from `ngAfterViewInit` when the name is
 * still empty so the value wins over `NgModel` initialization order.
 */
export function prefillApplicantNameField(
  loggedInCitizen: LoggedInCitizenService,
  citizenService: CitizenService,
  target: { name: string },
  cdr: ChangeDetectorRef
): void {
  if (target.name?.trim()) {
    return;
  }
  const id = loggedInCitizen.getCurrentLoggedInCitizenId();
  if (!id) {
    return;
  }
  void firstValueFrom(citizenService.getById(id)).then((citizen) => {
    if (!citizen) {
      const fallback = loggedInCitizen.getBadgeDisplayName()?.trim();
      if (fallback) {
        target.name = fallback;
        cdr.markForCheck();
      }
      return;
    }
    const full = citizenFullDisplayName(citizen);
    if (full) {
      target.name = full;
      cdr.markForCheck();
      return;
    }
    const fallback = loggedInCitizen.getBadgeDisplayName()?.trim();
    if (fallback) {
      target.name = fallback;
      cdr.markForCheck();
    }
  });
}
