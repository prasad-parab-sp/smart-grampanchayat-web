/** Pure helpers for citizen labels (no Injectable — see `CitizenService` for API). */
import { Citizen } from './citizen.models';

function trimField(s: string | null | undefined): string {
  if (s == null) {
    return '';
  }
  return s.trim();
}

/** Full legal-style line: **firstName**, **middleName** (if any), **lastName** — e.g. login toast & certificate prefill. */
export function citizenFullDisplayName(c: Citizen): string {
  return [trimField(c.firstName), trimField(c.middleName), trimField(c.lastName)]
    .filter((part) => part.length > 0)
    .join(' ');
}

/** **firstName** + **lastName** only — header badge session (no middle name). */
export function citizenBadgeDisplayName(c: Citizen): string {
  return [trimField(c.firstName), trimField(c.lastName)].filter((part) => part.length > 0).join(' ');
}
