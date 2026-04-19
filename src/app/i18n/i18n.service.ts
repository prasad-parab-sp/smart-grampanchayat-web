import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/** Locale codes this app loads and persists (ngx-translate JSON under `assets/i18n/`). */
export type SupportedLang = 'mr' | 'en';

/**
 * Application i18n facade over {@link TranslateService}.
 *
 * Owns language resolution order, persistence, and safe narrowing to {@link SupportedLang}.
 * Templates should keep using the `translate` pipe; use {@link I18nService.translate} for strings in TypeScript.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly storageKey = 'smart-gp.lang';

  /** Languages registered with ngx-translate via {@link TranslateService.addLangs}. */
  readonly supportedLangs: SupportedLang[] = ['mr', 'en'];

  constructor(private readonly translateService: TranslateService) {
    this.translateService.addLangs(this.supportedLangs);
    this.translateService.setFallbackLang('mr').subscribe();
  }

  /**
   * Sets the active language once at app startup.
   *
   * Priority: **saved preference** (localStorage) → **browser** language if supported → **`mr`**.
   */
  init(): void {
    const saved = this.safeGetSavedLang();
    const browser = this.safeToSupportedLang(this.translateService.getBrowserLang());
    this.use(saved ?? browser ?? 'mr');
  }

  /**
   * Switches UI language and persists the choice.
   *
   * @param lang - Must be one of {@link supportedLangs}.
   */
  use(lang: SupportedLang): void {
    this.translateService.use(lang).subscribe();
    try {
      localStorage.setItem(this.storageKey, lang);
    } catch {
      // ignore storage failures (private mode, blocked storage, etc.)
    }
  }

  /**
   * Synchronous translation for the **current** language (ngx-translate `instant`).
   *
   * @param key - JSON key, e.g. `'LOGIN.SUCCESS_ADMIN'`.
   * @param interpolate - Optional map for `{{...}}` placeholders in the message.
   * @returns Resolved string, or the key if missing (ngx-translate default).
   */
  translate(key: string, interpolate?: Record<string, string | number>): string {
    return this.translateService.instant(key, interpolate);
  }

  /** Active locale, normalized to {@link SupportedLang} (defaults to `'mr'` if unknown). */
  get currentLang(): SupportedLang {
    return this.safeToSupportedLang(this.translateService.getCurrentLang()) ?? 'mr';
  }

  /** Reads persisted language from localStorage; returns `null` if missing or unreadable. */
  private safeGetSavedLang(): SupportedLang | null {
    try {
      return this.safeToSupportedLang(localStorage.getItem(this.storageKey));
    } catch {
      return null;
    }
  }

  /**
   * Maps arbitrary language strings (storage, `getBrowserLang`) to a supported code.
   *
   * @returns `'mr'`, `'en'`, or `null` if not supported.
   */
  private safeToSupportedLang(lang: string | null | undefined): SupportedLang | null {
    if (lang === 'mr' || lang === 'en') return lang;
    return null;
  }
}
