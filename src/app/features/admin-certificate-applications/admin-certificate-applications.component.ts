import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { AdminSessionService } from '../../core/admin-session.service';
import { CertificateApplicationService } from '../../core/certificate-application.service';
import type {
  CertificateApplicationDto,
  CertificateApplicationStatus
} from '../../core/certificate-application.models';
import { CertificateTypeService } from '../../core/certificate-type.service';
import type { CertificateTypeDto } from '../../core/certificate-type.models';
import { I18nService } from '../../i18n/i18n.service';
import { ToastService } from '../../core/toast.service';
import { GramAppHeaderComponent } from '../../shared/components/gram-app-header/gram-app-header.component';
import { CertificateApplicationDetailSheetComponent } from '../../shared/components/certificate-application-detail-sheet/certificate-application-detail-sheet.component';
import { ICONS } from '../../shared';

type RegistryStatusFilter = 'ALL' | CertificateApplicationStatus;

@Component({
  selector: 'app-admin-certificate-applications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GramAppHeaderComponent,
    ReactiveFormsModule,
    CertificateApplicationDetailSheetComponent
  ],
  templateUrl: './admin-certificate-applications.component.html',
  styleUrls: ['./admin-certificate-applications.component.scss']
})
export class AdminCertificateApplicationsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly certificateApplications = inject(CertificateApplicationService);
  private readonly certificateTypes = inject(CertificateTypeService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly icons = ICONS;

  adminDisplayName: string | null = null;
  adminRoleLabel: string | null = null;
  isGramsevak = false;

  statusFilter: RegistryStatusFilter = 'ALL';
  searchQuery = '';

  loading = false;
  errorKey: string | null = null;
  rawRows: CertificateApplicationDto[] = [];
  private typeById = new Map<string, CertificateTypeDto>();

  readonly statusChips: { value: RegistryStatusFilter; labelKey: string }[] = [
    { value: 'ALL', labelKey: 'ADMIN_CERT_REGISTRY.STATUS_ALL' },
    { value: 'SUBMITTED', labelKey: 'ADMIN_CERT_REGISTRY.STATUS_SUBMITTED' },
    { value: 'PENDING_REVIEW', labelKey: 'ADMIN_CERT_REGISTRY.STATUS_PENDING_REVIEW' },
    { value: 'PENDING_PAYMENT', labelKey: 'ADMIN_CERT_REGISTRY.STATUS_PENDING_PAYMENT' },
    { value: 'APPROVED', labelKey: 'ADMIN_CERT_REGISTRY.STATUS_APPROVED' },
    { value: 'REJECTED', labelKey: 'ADMIN_CERT_REGISTRY.STATUS_REJECTED' },
    { value: 'CANCELLED', labelKey: 'ADMIN_CERT_REGISTRY.STATUS_CANCELLED' }
  ];

  approveDialogOpen = false;
  approveTarget: CertificateApplicationDto | null = null;
  approveSubmitting = false;
  approveRemarksDraft = '';
  readonly approveForm = this.fb.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required]
  });

  rejectDialogOpen = false;
  rejectTarget: CertificateApplicationDto | null = null;
  rejectSubmitting = false;
  rejectRemarksDraft = '';
  readonly rejectForm = this.fb.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required]
  });

  remarksOnlyDialogOpen = false;
  remarksOnlyTarget: CertificateApplicationDto | null = null;
  remarksOnlySubmitting = false;
  remarksOnlyDraft = '';
  readonly remarksOnlyForm = this.fb.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required]
  });

  detailSheetOpen = false;
  detailSheetLoading = false;
  detailApplication: CertificateApplicationDto | null = null;
  detailCertificateTypeLabel = '';
  detailStatusLabel = '';
  detailCanAppendStaffRemarks = false;

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
    void this.load();
  }

  get filteredRows(): CertificateApplicationDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.rawRows.filter((r) => {
      if (!q) {
        return true;
      }
      const type = this.certificateTypeLabel(r.certificateTypeId).toLowerCase();
      const mobile = (r.applicantMobile ?? '').toLowerCase();
      const name = r.applicantFullName.toLowerCase();
      return (
        r.applicationNumber.toLowerCase().includes(q) ||
        name.includes(q) ||
        mobile.includes(q) ||
        type.includes(q)
      );
    });
  }

  setStatusFilter(v: RegistryStatusFilter): void {
    this.statusFilter = v;
    void this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.errorKey = null;
    try {
      const status = this.statusFilter === 'ALL' ? undefined : this.statusFilter;
      const [types, apps] = await Promise.all([
        firstValueFrom(this.certificateTypes.list()),
        firstValueFrom(this.certificateApplications.list(undefined, status))
      ]);
      this.typeById = new Map((types ?? []).map((t) => [t.id, t]));
      this.rawRows = apps ?? [];
    } catch {
      this.rawRows = [];
      this.typeById = new Map();
      this.errorKey = 'ADMIN_CERT_REGISTRY.ERR_LOAD';
    } finally {
      this.loading = false;
    }
  }

  logout(): void {
    this.adminSession.clear();
    void this.router.navigate(['/login']);
  }

  openAdminHome(): void {
    void this.router.navigateByUrl('/admin/home');
  }

  certificateTypeLabel(typeId: string): string {
    const t = this.typeById.get(typeId);
    if (!t) {
      return typeId;
    }
    if (this.i18n.currentLang === 'en' && t.nameEn?.trim()) {
      return t.nameEn.trim();
    }
    return t.nameMr?.trim() || t.code;
  }

  statusLabel(status: CertificateApplicationStatus): string {
    const key = `PROFILE.STATUS_${status}` as const;
    const t = this.i18n.translate(key);
    return t !== key ? t : status;
  }

  statusBadgeClass(status: CertificateApplicationStatus): string {
    switch (status) {
      case 'APPROVED':
        return 'acr-badge acr-badge--g';
      case 'REJECTED':
      case 'CANCELLED':
        return 'acr-badge acr-badge--r';
      default:
        return 'acr-badge acr-badge--o';
    }
  }

  formatSubmittedAt(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    try {
      const loc = this.i18n.currentLang === 'mr' ? 'mr-IN' : 'en-IN';
      return d.toLocaleString(loc, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return d.toLocaleString();
    }
  }

  canApproveRow(row: CertificateApplicationDto): boolean {
    if (!this.isGramsevak) {
      return false;
    }
    return row.status === 'SUBMITTED' || row.status === 'PENDING_REVIEW';
  }

  private canRejectRowStatus(status: CertificateApplicationStatus): boolean {
    return status === 'SUBMITTED' || status === 'PENDING_REVIEW' || status === 'PENDING_PAYMENT';
  }

  canRejectRow(row: CertificateApplicationDto): boolean {
    return this.isGramsevak && this.canRejectRowStatus(row.status);
  }

  canRemarksOnlyRow(row: CertificateApplicationDto): boolean {
    return this.canAppendStaffRemarksForStatus(row.status);
  }

  staffDefaultLoginIdentifier(): string | null {
    return this.adminSession.get()?.loginIdentifier?.trim() || null;
  }

  private canAppendStaffRemarksForStatus(status: CertificateApplicationStatus): boolean {
    if (!this.isGramsevak) {
      return false;
    }
    return status !== 'APPROVED' && status !== 'REJECTED' && status !== 'CANCELLED';
  }

  onDetailStaffRemarksUpdated(dto: CertificateApplicationDto): void {
    this.detailApplication = dto;
    this.detailCanAppendStaffRemarks = this.canAppendStaffRemarksForStatus(dto.status);
    void this.load();
  }

  async openApplicationDetail(row: CertificateApplicationDto): Promise<void> {
    this.detailSheetOpen = true;
    this.detailSheetLoading = true;
    this.detailApplication = row;
    this.detailCertificateTypeLabel = this.certificateTypeLabel(row.certificateTypeId);
    this.detailStatusLabel = this.statusLabel(row.status);
    this.detailCanAppendStaffRemarks = this.canAppendStaffRemarksForStatus(row.status);
    try {
      const fresh = await firstValueFrom(this.certificateApplications.getById(row.id));
      this.detailApplication = fresh;
      this.detailCertificateTypeLabel = this.certificateTypeLabel(fresh.certificateTypeId);
      this.detailStatusLabel = this.statusLabel(fresh.status);
      this.detailCanAppendStaffRemarks = this.canAppendStaffRemarksForStatus(fresh.status);
    } catch {
      // keep list snapshot
    } finally {
      this.detailSheetLoading = false;
    }
  }

  closeApplicationDetail(): void {
    this.detailSheetOpen = false;
    this.detailSheetLoading = false;
    this.detailApplication = null;
    this.detailCertificateTypeLabel = '';
    this.detailStatusLabel = '';
    this.detailCanAppendStaffRemarks = false;
  }

  openApproveDialog(row: CertificateApplicationDto): void {
    this.approveTarget = row;
    const admin = this.adminSession.get();
    this.approveRemarksDraft = '';
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
    this.approveRemarksDraft = '';
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
    const remarkLines = this.approveRemarksDraft
      .split(/\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    this.approveSubmitting = true;
    try {
      await firstValueFrom(
        this.certificateApplications.approve(this.approveTarget.id, {
          identifier: identifier.trim(),
          password,
          ...(remarkLines.length ? { remarksToAppend: remarkLines } : {})
        })
      );
      this.toast.show(this.i18n.translate('ADMIN_HOME.PENDING_CERT_APPROVED'), 'success');
      this.closeApproveDialog();
      await this.load();
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

  openRejectDialog(row: CertificateApplicationDto): void {
    this.rejectTarget = row;
    const admin = this.adminSession.get();
    this.rejectRemarksDraft = '';
    this.rejectForm.reset({
      identifier: admin?.loginIdentifier?.trim() ?? '',
      password: ''
    });
    this.rejectDialogOpen = true;
  }

  closeRejectDialog(): void {
    this.rejectDialogOpen = false;
    this.rejectTarget = null;
    this.rejectSubmitting = false;
    this.rejectRemarksDraft = '';
  }

  async confirmReject(): Promise<void> {
    if (this.rejectForm.invalid || !this.rejectTarget) {
      this.rejectForm.markAllAsTouched();
      return;
    }
    const { identifier, password } = this.rejectForm.getRawValue();
    if (!identifier.trim() || !password) {
      return;
    }
    const remarkLines = this.rejectRemarksDraft
      .split(/\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    this.rejectSubmitting = true;
    try {
      await firstValueFrom(
        this.certificateApplications.reject(this.rejectTarget.id, {
          identifier: identifier.trim(),
          password,
          ...(remarkLines.length ? { remarksToAppend: remarkLines } : {})
        })
      );
      this.toast.show(this.i18n.translate('ADMIN_CERT_APP_DETAIL.REJECTED_TOAST'), 'success');
      this.closeRejectDialog();
      await this.load();
    } catch (err) {
      const status = (err as HttpErrorResponse | undefined)?.status ?? 0;
      if (status === 401) {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_HOME.PENDING_CERT_ERR_AUTH')}`, 'error');
      } else if (status === 403) {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_HOME.PENDING_CERT_ERR_FORBIDDEN')}`, 'error');
      } else if (status === 409) {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_CERT_APP_DETAIL.ERR_REJECT_CONFLICT')}`, 'error');
      } else {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_CERT_APP_DETAIL.ERR_REJECT_GENERIC')}`, 'error');
      }
    } finally {
      this.rejectSubmitting = false;
    }
  }

  openRemarksOnlyDialog(row: CertificateApplicationDto): void {
    this.remarksOnlyTarget = row;
    const admin = this.adminSession.get();
    this.remarksOnlyDraft = '';
    this.remarksOnlyForm.reset({
      identifier: admin?.loginIdentifier?.trim() ?? '',
      password: ''
    });
    this.remarksOnlyDialogOpen = true;
  }

  closeRemarksOnlyDialog(): void {
    this.remarksOnlyDialogOpen = false;
    this.remarksOnlyTarget = null;
    this.remarksOnlySubmitting = false;
    this.remarksOnlyDraft = '';
  }

  async confirmRemarksOnly(): Promise<void> {
    if (this.remarksOnlyForm.invalid || !this.remarksOnlyTarget) {
      this.remarksOnlyForm.markAllAsTouched();
      return;
    }
    const { identifier, password } = this.remarksOnlyForm.getRawValue();
    if (!identifier.trim() || !password) {
      return;
    }
    const lines = this.remarksOnlyDraft
      .split(/\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (!lines.length) {
      this.toast.show(this.i18n.translate('ADMIN_CERT_APP_DETAIL.ERR_REMARKS_ONLY_EMPTY'), 'error');
      return;
    }
    this.remarksOnlySubmitting = true;
    try {
      await firstValueFrom(
        this.certificateApplications.appendStaffRemarks(this.remarksOnlyTarget.id, {
          identifier: identifier.trim(),
          password,
          texts: lines
        })
      );
      this.toast.show(this.i18n.translate('ADMIN_CERT_APP_DETAIL.REMARK_SAVED'), 'success');
      this.closeRemarksOnlyDialog();
      await this.load();
    } catch (err) {
      const status = (err as HttpErrorResponse | undefined)?.status ?? 0;
      if (status === 401) {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_HOME.PENDING_CERT_ERR_AUTH')}`, 'error');
      } else if (status === 403) {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_HOME.PENDING_CERT_ERR_FORBIDDEN')}`, 'error');
      } else if (status === 409) {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_CERT_APP_DETAIL.ERR_REMARK_STATUS')}`, 'error');
      } else {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_CERT_APP_DETAIL.ERR_REMARK_GENERIC')}`, 'error');
      }
    } finally {
      this.remarksOnlySubmitting = false;
    }
  }
}
