import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { TenantService } from '../core/tenant.service';
import { LanguageSwitcherComponent } from '../shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-tenant-error',
  standalone: true,
  imports: [CommonModule, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './tenant-error.component.html',
  styleUrls: ['./tenant-error.component.scss']
})
export class TenantErrorComponent {
  retryPending = false;

  constructor(
    private readonly tenant: TenantService,
    private readonly router: Router
  ) {}

  get attemptedTenantCode(): string | null {
    const c = this.tenant.activeTenantCode?.trim();
    return c || null;
  }

  /** Re-fetch tenant; on success, open login (tenant guard passes). */
  async retry(): Promise<void> {
    if (this.retryPending) {
      return;
    }
    this.retryPending = true;
    try {
      await this.tenant.loadOnStartup();
      if (this.tenant.loadState === 'ok') {
        await this.router.navigate(['/login'], { replaceUrl: true });
      }
    } finally {
      this.retryPending = false;
    }
  }
}
