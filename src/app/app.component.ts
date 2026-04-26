import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TenantService } from './core/services/tenant.service';
import { I18nService } from './i18n/i18n.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      width: 100%;
      min-height: 100vh;
      background: #fff;
      position: relative;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'SmartGramPanchayat';

  private readonly tenantService = inject(TenantService);
  private readonly i18n = inject(I18nService);

  constructor() {
    this.i18n.init();
  }

  ngOnInit(): void {
    this.tenantService.getDefaultTenant().subscribe({
      next: (tenant) => {
        console.log('[SmartGramPanchayat] Tenant (via TenantService + interceptor):', tenant);
      },
      error: (err) => {
        console.warn(
          '[SmartGramPanchayat] Tenant API failed. Start Spring on :8080 and use `ng serve` (dev proxy to /api).',
          err
        );
      },
    });
  }
}
