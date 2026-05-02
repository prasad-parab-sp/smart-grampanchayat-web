import { Injectable } from '@angular/core';

import { citizenBadgeDisplayName } from './citizen-name.util';
import { Citizen } from './citizen.models';

/**
 * Tab-scoped logged-in citizen (no JWT). Persisted: {@link CURRENT_CITIZEN_ID_KEY} in sessionStorage.
 * Header badge label is in-memory only; after refresh, load citizen by id and call `setBadgeDisplayName`.
 * Tenant remains in {@link TenantSessionStore}.
 */
const CURRENT_CITIZEN_ID_KEY = 'smart-gp.citizen-id';

/** @deprecated Legacy keys — cleared on {@link LoggedInCitizenService.clearSession}. */
const LEGACY_BADGE_KEY = 'smart-gp.citizen-badge-name';
const LEGACY_MOBILE_KEY = 'smart-gp.citizen-login-mobile';

/** Opaque id for the logged-in citizen (extensible later). */
export interface LoggedInCitizenRef {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class LoggedInCitizenService {
  private get storage() {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  }

  private badgeDisplayName: string | null = null;

  /** Persisted citizen id for this tab, or null if not logged in. */
  getCurrentLoggedInCitizenId(): string | null {
    const raw = this.storage?.getItem(CURRENT_CITIZEN_ID_KEY);
    return raw?.trim() || null;
  }

  /** Wrapper when you want an object (e.g. future fields). */
  getCurrentLoggedInCitizen(): LoggedInCitizenRef | null {
    const id = this.getCurrentLoggedInCitizenId();
    return id ? { id } : null;
  }

  /**
   * Persists citizen id and in-memory header badge after a successful lookup (e.g. login).
   */
  setLoggedInCitizen(citizen: Citizen): void {
    const id = citizen.id?.trim();
    if (!id) {
      return;
    }
    this.storage?.setItem(CURRENT_CITIZEN_ID_KEY, id);
    this.setBadgeDisplayName(citizen);
  }

  /**
   * In-memory header badge (e.g. first + last). Pass a ready-made label or a {@link Citizen} to derive it.
   */
  setBadgeDisplayName(labelOrCitizen: string | Citizen): void {
    const raw =
      typeof labelOrCitizen === 'string'
        ? labelOrCitizen
        : citizenBadgeDisplayName(labelOrCitizen);
    const b = raw.trim();
    this.badgeDisplayName = b || null;
  }

  getBadgeDisplayName(): string | null {
    return this.badgeDisplayName?.trim() || null;
  }

  clearSession(): void {
    this.storage?.removeItem(CURRENT_CITIZEN_ID_KEY);
    this.storage?.removeItem(LEGACY_BADGE_KEY);
    this.storage?.removeItem(LEGACY_MOBILE_KEY);
    this.badgeDisplayName = null;
  }
}
