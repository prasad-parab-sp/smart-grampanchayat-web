import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AdminSessionService } from '../../core/admin-session.service';
import { CertificateApplicationService } from '../../core/certificate-application.service';
import type { CertificateApplicationDto } from '../../core/certificate-application.models';
import { I18nService } from '../../i18n/i18n.service';
import { ToastService } from '../../core/toast.service';
import { GramAppHeaderComponent } from '../../shared/components/gram-app-header/gram-app-header.component';
import { ICONS } from '../../shared';

interface AdminChip {
  icon: string;
  labelKey: string;
  active?: boolean;
  route?: string;
}

interface AdminQuickAction {
  icon: string;
  titleKey: string;
  subtitleKey: string;
  route?: string;
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, TranslateModule, GramAppHeaderComponent, ReactiveFormsModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly certificateApplications = inject(CertificateApplicationService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  adminDisplayName: string | null = null;
  adminRoleLabel: string | null = null;
  readonly icons = ICONS;

  /** Only stored-role Gramsevak may see the pending-approval queue (not acting Sarpanch). */
  isGramsevak = false;
  pendingLoading = false;
  pendingRows: CertificateApplicationDto[] = [];
  pendingErrorKey: string | null = null;
  /** Collapsed by default so the admin home page stays short; expand to see the scrollable list. */
  pendingCertExpanded = false;

  approveDialogOpen = false;
  approveTarget: CertificateApplicationDto | null = null;
  approveSubmitting = false;
  readonly approveForm = this.fb.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required]
  });

  readonly chips: AdminChip[] = [
    { icon: '🏠', labelKey: 'ADMIN_HOME.CHIP_DASHBOARD', active: true, route: '/admin/home' },
    { icon: '📝', labelKey: 'ADMIN_HOME.CHIP_RECORDS' },
    { icon: '📢', labelKey: 'ADMIN_HOME.CHIP_NOTICES' },
    { icon: '📄', labelKey: 'ADMIN_HOME.CHIP_FORMATS', route: '/admin/formats' },
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
    {
      icon: '📄',
      titleKey: 'ADMIN_HOME.ACTION_FORMAT',
      subtitleKey: 'ADMIN_HOME.ACTION_FORMAT_SUB',
      route: '/admin/formats'
    },
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
    this.isGramsevak = admin.storedRole === 'GRAMSEVAK';
    if (this.isGramsevak) {
      void this.loadPendingCertificates();
    }
  }

  logout(): void {
    this.adminSession.clear();
    void this.router.navigate(['/login']);
  }

  openRoute(route?: string): void {
    if (!route) {
      return;
    }
    void this.router.navigateByUrl(route);
  }

  togglePendingCertPanel(): void {
    this.pendingCertExpanded = !this.pendingCertExpanded;
  }

  onRefreshPending(): void {
    void this.loadPendingCertificates();
  }

  async loadPendingCertificates(): Promise<void> {
    this.pendingLoading = true;
    this.pendingErrorKey = null;
    try {
      const [submitted, pendingReview] = await Promise.all([
        firstValueFrom(this.certificateApplications.list(undefined, 'SUBMITTED')),
        firstValueFrom(this.certificateApplications.list(undefined, 'PENDING_REVIEW'))
      ]);
      const byId = new Map<string, CertificateApplicationDto>();
      for (const row of [...submitted, ...pendingReview]) {
        byId.set(row.id, row);
      }
      this.pendingRows = Array.from(byId.values()).sort((x, y) =>
        x.submittedAt < y.submittedAt ? 1 : x.submittedAt > y.submittedAt ? -1 : 0
      );
    } catch {
      this.pendingErrorKey = 'ADMIN_HOME.PENDING_CERT_ERR_LOAD';
      this.pendingRows = [];
    } finally {
      this.pendingLoading = false;
    }
  }

  openApproveDialog(row: CertificateApplicationDto): void {
    this.approveTarget = row;
    const admin = this.adminSession.get();
    this.approveForm.reset({
      identifier: admin?.loginIdentifier?.trim() ?? '',
      password: ''
    });
    this.approveDialogOpen = true;
  }

  closeApproveDialog(): void {
    this.approveDialogOpen = false;
    this.approveTarget = null;
    this.approveSubmitting = false;
  }

  async confirmApprove(): Promise<void> {
    if (this.approveForm.invalid || !this.approveTarget) {
      this.approveForm.markAllAsTouched();
      return;
    }
    const { identifier, password } = this.approveForm.getRawValue();
    if (!identifier.trim() || !password) {
      return;
    }
    this.approveSubmitting = true;
    try {
      await firstValueFrom(
        this.certificateApplications.approve(this.approveTarget.id, {
          identifier: identifier.trim(),
          password
        })
      );
      this.toast.show(this.i18n.translate('ADMIN_HOME.PENDING_CERT_APPROVED'), 'success');
      this.closeApproveDialog();
      await this.loadPendingCertificates();
    } catch (err) {
      const status = (err as HttpErrorResponse | undefined)?.status ?? 0;
      if (status === 401) {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_HOME.PENDING_CERT_ERR_AUTH')}`, 'error');
      } else if (status === 403) {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_HOME.PENDING_CERT_ERR_FORBIDDEN')}`, 'error');
      } else if (status === 409) {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_HOME.PENDING_CERT_ERR_CONFLICT')}`, 'error');
      } else {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_HOME.PENDING_CERT_ERR_GENERIC')}`, 'error');
      }
    } finally {
      this.approveSubmitting = false;
    }
  }
}
