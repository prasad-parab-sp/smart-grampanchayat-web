import { Injectable } from '@angular/core';

const CITIZEN_WELCOME_KEY = 'smart-gp.citizen-welcome';

@Injectable({ providedIn: 'root' })
export class CitizenSessionStore {
  private get storage() {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  }

  /** First + last name stored at citizen login (`citizenBadgeFirstLastName`); truncation is UI-only in the header. */
  getWelcomeDisplayName(): string | null {
    const raw = this.storage?.getItem(CITIZEN_WELCOME_KEY);
    return raw?.trim() || null;
  }

  setWelcomeDisplayName(name: string): void {
    const n = name.trim();
    if (!n) {
      return;
    }
    this.storage?.setItem(CITIZEN_WELCOME_KEY, n);
  }

  clearWelcome(): void {
    this.storage?.removeItem(CITIZEN_WELCOME_KEY);
  }
}
