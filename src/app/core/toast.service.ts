import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private static readonly DURATION_MS = 3000;

  /**
   * Same timing as `toast()` in master_fixed-3-2.html (`setTimeout` 2800ms before dropping `.show`).
   */
  private static readonly MASTER_TOAST_DISPLAY_MS = 2800;

  /** Matches master `.toast { transition: opacity .3s }` */
  private static readonly MASTER_TOAST_FADE_MS = 300;

  show(message: string, type: 'success' | 'error'): void {
    const el = document.createElement('div');
    el.className = `app-toast app-toast--${type}`;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, ToastService.DURATION_MS);
  }

  /**
   * Login success toast — visual behaviour aligned with **master_fixed-3-2.html** §4 TOAST NOTIFICATION
   * (`.toast`, `.toast.s`, bottom offset, pill radius, opacity fade).
   * Citizen: two stacked lines (name + welcome); admin: single line.
   */
  showLoginWelcome(
    primary: string,
    welcomeSuffix?: string,
    opts?: { truncatePrimary?: number }
  ): void {
    let main = primary.trim();
    const max = opts?.truncatePrimary;
    if (max != null && main.length > max) {
      main = `${main.slice(0, max)}…`;
    }
    if (!main) {
      return;
    }

    const el = document.createElement('div');
    el.className = 'app-toast app-toast--login-welcome';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');

    const card = document.createElement('div');
    card.className = 'app-toast__login-card';

    const suffix = welcomeSuffix?.trim();
    if (!suffix) {
      card.classList.add('app-toast__login-card--single');
      card.textContent = main;
    } else {
      const nameEl = document.createElement('span');
      nameEl.className = 'app-toast__login-name';
      nameEl.textContent = main;

      const welcomeEl = document.createElement('span');
      welcomeEl.className = 'app-toast__login-welcome-txt';
      welcomeEl.textContent = suffix;

      card.append(nameEl, welcomeEl);
    }

    el.appendChild(card);
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('app-toast--login-welcome-visible');
      });
    });

    window.setTimeout(() => {
      el.classList.remove('app-toast--login-welcome-visible');
      window.setTimeout(
        () => el.remove(),
        ToastService.MASTER_TOAST_FADE_MS + 30
      );
    }, ToastService.MASTER_TOAST_DISPLAY_MS);
  }
}
