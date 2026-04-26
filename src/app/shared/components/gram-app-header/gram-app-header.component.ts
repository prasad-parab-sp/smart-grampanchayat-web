import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { TenantSessionStore } from '../../../core/tenant-session.store';
import { I18nService } from '../../../i18n/i18n.service';
import { HeroBannerConfig } from '../hero-banner/hero-banner-config.model';
import { formatTalukaDistrictLine, heroBannerConfigFromSession } from '../hero-banner/hero-banner.mapper';
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
export class GramAppHeaderComponent {
  readonly i18n = inject(I18nService);
  private readonly session = inject(TenantSessionStore);

  tenantConfig: HeroBannerConfig = heroBannerConfigFromSession(this.session);

  get gpTitleName(): string {
    const v = this.i18n.currentLang === 'en' ? this.tenantConfig.displayNameEn : this.tenantConfig.displayNameMr;
    return v.trim();
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
