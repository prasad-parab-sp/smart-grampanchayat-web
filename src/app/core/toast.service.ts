import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private static readonly DURATION_MS = 3000;

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
}
