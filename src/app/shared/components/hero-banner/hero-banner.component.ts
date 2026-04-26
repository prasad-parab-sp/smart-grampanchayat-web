import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { TenantSessionStore } from '../../../core/tenant-session.store';
import { I18nService } from '../../../i18n/i18n.service';
import { HeroBannerConfig } from './hero-banner-config.model';
import { formatTalukaDistrictLine, gpTitleNameForLang, heroBannerConfigFromSession } from './hero-banner.mapper';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './hero-banner.component.html',
  styleUrls: ['./hero-banner.component.scss']
})
export class HeroBannerComponent {
  readonly i18n = inject(I18nService);
  private readonly session = inject(TenantSessionStore);

  tenantConfig: HeroBannerConfig = heroBannerConfigFromSession(this.session);

  /** GP name for the active UI language (API-sourced; not a translation key). */
  get gpTitleName(): string {
    return gpTitleNameForLang(this.tenantConfig, this.i18n.currentLang);
  }

  get talukaDistrictLine(): string {
    return formatTalukaDistrictLine(this.tenantConfig, this.i18n.currentLang);
  }

  readonly defaultLogoUrl = '/assets/images/logo.png';
  readonly defaultBannerUrl = '/assets/images/Gram-Panchayat.png';
}
