/** Pure helpers for citizen labels (no Injectable — see `CitizenService` for API). */
import { Citizen } from './citizen.models';

function trimField(s: string | null | undefined): string {
  if (s == null) {
    return '';
  }
  return s.trim();
}

/** Welcome badge + toast (name line): **firstName** + **lastName** only — no middle name. */
export function citizenBadgeFirstLastName(c: Citizen): string {
  const first = trimField(c.firstName);
  const last = trimField(c.lastName);
  if (first && last) {
    return `${first} ${last}`;
  }
  return first || last;
}
