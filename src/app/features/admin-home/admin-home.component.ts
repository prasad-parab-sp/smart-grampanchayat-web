import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AdminSessionService } from '../../core/admin-session.service';
import { GramAppHeaderComponent } from '../../shared/components/gram-app-header/gram-app-header.component';

interface AdminChip {
  icon: string;
  labelKey: string;
  active?: boolean;
}

interface AdminQuickAction {
  icon: string;
  titleKey: string;
  subtitleKey: string;
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, TranslateModule, GramAppHeaderComponent],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent implements OnInit {
  adminDisplayName: string | null = null;
  adminRoleLabel: string | null = null;

  readonly chips: AdminChip[] = [
    { icon: '🏠', labelKey: 'ADMIN_HOME.CHIP_DASHBOARD', active: true },
    { icon: '📝', labelKey: 'ADMIN_HOME.CHIP_RECORDS' },
    { icon: '📢', labelKey: 'ADMIN_HOME.CHIP_NOTICES' },
    { icon: '📄', labelKey: 'ADMIN_HOME.CHIP_FORMATS' },
    { icon: '🚜', labelKey: 'ADMIN_HOME.CHIP_MACHINERY' },
    { icon: '🏗️', labelKey: 'ADMIN_HOME.CHIP_FUNDS' },
    { icon: '🏦', labelKey: 'ADMIN_HOME.CHIP_BANK' },
    { icon: '👥', labelKey: 'ADMIN_HOME.CHIP_VILLAGERS' },
    { icon: '📊', labelKey: 'ADMIN_HOME.CHIP_REPORTS' },
    { icon: '⚙️', labelKey: 'ADMIN_HOME.CHIP_SETTINGS' }
  ];

  readonly quickActions: AdminQuickAction[] = [
    { icon: '🏠', titleKey: 'ADMIN_HOME.ACTION_HOUSE_TAX', subtitleKey: 'ADMIN_HOME.ACTION_HOUSE_TAX_SUB' },
    { icon: '💧', titleKey: 'ADMIN_HOME.ACTION_WATER', subtitleKey: 'ADMIN_HOME.ACTION_WATER_SUB' },
    { icon: '📢', titleKey: 'ADMIN_HOME.ACTION_NOTICE', subtitleKey: 'ADMIN_HOME.ACTION_NOTICE_SUB' },
    { icon: '📄', titleKey: 'ADMIN_HOME.ACTION_FORMAT', subtitleKey: 'ADMIN_HOME.ACTION_FORMAT_SUB' },
    { icon: '📱', titleKey: 'ADMIN_HOME.ACTION_WHATSAPP', subtitleKey: 'ADMIN_HOME.ACTION_WHATSAPP_SUB' },
    { icon: '⚙️', titleKey: 'ADMIN_HOME.ACTION_SETTINGS', subtitleKey: 'ADMIN_HOME.ACTION_SETTINGS_SUB' },
    { icon: '🚜', titleKey: 'ADMIN_HOME.ACTION_MACHINERY', subtitleKey: 'ADMIN_HOME.ACTION_MACHINERY_SUB' },
    { icon: '🏗️', titleKey: 'ADMIN_HOME.ACTION_FUNDS', subtitleKey: 'ADMIN_HOME.ACTION_FUNDS_SUB' },
    { icon: '🏦', titleKey: 'ADMIN_HOME.ACTION_BANK', subtitleKey: 'ADMIN_HOME.ACTION_BANK_SUB' },
    { icon: '👥', titleKey: 'ADMIN_HOME.ACTION_VILLAGERS', subtitleKey: 'ADMIN_HOME.ACTION_VILLAGERS_SUB' },
    { icon: '📊', titleKey: 'ADMIN_HOME.ACTION_REPORT', subtitleKey: 'ADMIN_HOME.ACTION_REPORT_SUB' },
    { icon: '🔔', titleKey: 'ADMIN_HOME.ACTION_MEETING', subtitleKey: 'ADMIN_HOME.ACTION_MEETING_SUB' }
  ];

  constructor(
    private readonly adminSession: AdminSessionService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const admin = this.adminSession.get();
    if (!admin) {
      void this.router.navigate(['/login']);
      return;
    }
    this.adminDisplayName = `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim() || null;
    this.adminRoleLabel = admin.role?.trim().replaceAll('_', ' ') || null;
  }

  logout(): void {
    this.adminSession.clear();
    void this.router.navigate(['/login']);
  }
}
