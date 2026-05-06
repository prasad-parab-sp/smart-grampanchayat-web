import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { CitizenService } from '../../../core/citizen.service';
import { LoggedInCitizenService } from '../../../core/logged-in-citizen.service';
import { TenantSessionStore } from '../../../core/tenant-session.store';
import { I18nService } from '../../../i18n/i18n.service';
import { HeroBannerConfig } from '../hero-banner/hero-banner-config.model';
import { formatTalukaDistrictLine, gpTitleNameForLang, heroBannerConfigFromSession } from '../hero-banner/hero-banner.mapper';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

/**
 * App shell header (home and other main routes). Same tenant-driven copy and assets
 * as {@link app-hero-banner} — session + {@link I18nService} for title / taluka·district.
 */
@Component({
  selector: 'app-gram-app-header',
  standalone: true,
  imports: [CommonModule, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './gram-app-header.component.html',
  styleUrls: ['./gram-app-header.component.scss']
})
export class GramAppHeaderComponent implements OnInit {
  @Input() badgeDisplayNameOverride: string | null = null;

  readonly i18n = inject(I18nService);
  private readonly session = inject(TenantSessionStore);
  private readonly loggedInCitizen = inject(LoggedInCitizenService);
  private readonly citizenService = inject(CitizenService);
  private readonly cdr = inject(ChangeDetectorRef);

  tenantConfig: HeroBannerConfig = heroBannerConfigFromSession(this.session);

  ngOnInit(): void {
    const id = this.loggedInCitizen.getCurrentLoggedInCitizenId()?.trim();
    if (id && !this.loggedInCitizen.getBadgeDisplayName()?.trim()) {
      void firstValueFrom(this.citizenService.getById(id)).then((c) => {
        if (c) {
          this.loggedInCitizen.setBadgeDisplayName(c);
          this.cdr.markForCheck();
        }
      });
    }
  }

  /** Badge: first + last in memory (set at login or after refresh hydration); max 20 chars + ellipsis in template. */
  get badgeNameForHeader(): string | null {
    const raw = (this.badgeDisplayNameOverride ?? this.loggedInCitizen.getBadgeDisplayName())?.trim();
    if (!raw) {
      return null;
    }
    const max = 20;
    return raw.length <= max ? raw : `${raw.slice(0, max)}…`;
  }

  get gpTitleName(): string {
    return gpTitleNameForLang(this.tenantConfig, this.i18n.currentLang);
  }

  get talukaDistrictLine(): string {
    return formatTalukaDistrictLine(this.tenantConfig, this.i18n.currentLang);
  }

  readonly defaultLogoUrl = '/assets/images/logo.png';
  readonly defaultBannerUrl = '/assets/images/Gram-Panchayat.png';

  @Output() logout = new EventEmitter<void>();

  onLogout(): void {
    this.logout.emit();
  }
}
