import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { CertificateApplicationService } from '../../../../core/certificate-application.service';
import {
  CertificateApplicationDto,
  CertificateApplicationStatus,
  CertificateStaffRemarkDto
} from '../../../../core/certificate-application.models';
import { CertificateTypeService } from '../../../../core/certificate-type.service';
import { CertificateTypeDto } from '../../../../core/certificate-type.models';
import { LoggedInCitizenService } from '../../../../core/logged-in-citizen.service';
import { ToastService } from '../../../../core/toast.service';

export type CitizenAppSegment = 'all' | 'progress' | 'approved' | 'closed';

@Component({
  selector: 'app-certificate-my-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './certificate-my-applications.component.html',
  styleUrls: ['./certificate-my-applications.component.scss']
})
export class CertificateMyApplicationsComponent implements OnInit {
  segment: CitizenAppSegment = 'all';
  searchQuery = '';

  loading = true;
  loadError = false;

  allRows: CertificateApplicationDto[] = [];
  private typeById = new Map<string, CertificateTypeDto>();

  certModalOpen = false;
  certModalLoading = false;
  certModalHtml: SafeHtml | null = null;
  certModalNumber = '';
  certLoadAppId: string | null = null;

  constructor(
    private readonly router: Router,
    private readonly loggedInCitizen: LoggedInCitizenService,
    private readonly certificateApplications: CertificateApplicationService,
    private readonly certificateTypes: CertificateTypeService,
    private readonly translate: TranslateService,
    private readonly toast: ToastService,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    void this.bootstrap();
  }

  get counts(): { total: number; progress: number; approved: number; closed: number } {
    const rows = this.allRows;
    let progress = 0;
    let approved = 0;
    let closed = 0;
    for (const r of rows) {
      if (this.isProgressStatus(r.status)) {
        progress++;
      } else if (r.status === 'APPROVED') {
        approved++;
      } else if (r.status === 'REJECTED' || r.status === 'CANCELLED') {
        closed++;
      }
    }
    return { total: rows.length, progress, approved, closed };
  }

  get filteredRows(): CertificateApplicationDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.allRows.filter((r) => {
      if (!this.matchesSegment(r.status)) {
        return false;
      }
      if (!q) {
        return true;
      }
      const typeLabel = this.certificateTypeLabel(r.certificateTypeId).toLowerCase();
      return (
        r.applicationNumber.toLowerCase().includes(q) ||
        r.applicantFullName.toLowerCase().includes(q) ||
        typeLabel.includes(q)
      );
    });
  }

  setSegment(s: CitizenAppSegment): void {
    this.segment = s;
  }

  async bootstrap(): Promise<void> {
    const citizenId = this.loggedInCitizen.getCurrentLoggedInCitizenId();
    if (!citizenId) {
      void this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.loadError = false;
    try {
      const [types, apps] = await Promise.all([
        firstValueFrom(this.certificateTypes.list()),
        firstValueFrom(this.certificateApplications.list(citizenId))
      ]);
      this.typeById = new Map((types ?? []).map((t) => [t.id, t]));
      this.allRows = apps ?? [];
    } catch {
      this.allRows = [];
      this.typeById = new Map();
      this.loadError = true;
      this.toast.show(this.translate.instant('CERTIFICATE_MY_APPLICATIONS.ERR_LOAD'), 'error');
    } finally {
      this.loading = false;
    }
  }

  async onRefresh(): Promise<void> {
    await this.bootstrap();
  }

  certificateTypeLabel(typeId: string): string {
    const t = this.typeById.get(typeId);
    if (!t) {
      return typeId;
    }
    const lang = this.translate.currentLang || this.translate.getDefaultLang();
    if (lang === 'en' && t.nameEn?.trim()) {
      return t.nameEn.trim();
    }
    return t.nameMr?.trim() || t.code;
  }

  statusBadgeClass(status: CertificateApplicationStatus): string {
    switch (status) {
      case 'APPROVED':
        return 'badge-g';
      case 'REJECTED':
      case 'CANCELLED':
        return 'badge-r';
      default:
        return 'badge-o';
    }
  }

  statusLabel(status: CertificateApplicationStatus): string {
    const key = `PROFILE.STATUS_${status}` as const;
    const t = this.translate.instant(key);
    return t !== key ? t : status;
  }

  formatSubmittedAt(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    try {
      return d.toLocaleDateString(this.translate.currentLang === 'mr' ? 'mr-IN' : 'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return d.toLocaleDateString();
    }
  }

  /** GP remarks are only shown once the application exists as submitted (server always sets submittedAt). */
  showCitizenStaffRemarks(app: CertificateApplicationDto): boolean {
    if (!app.submittedAt?.trim()) {
      return false;
    }
    return !!(app.staffRemarks && app.staffRemarks.length > 0);
  }

  sortedStaffRemarks(app: CertificateApplicationDto): CertificateStaffRemarkDto[] {
    const list = app.staffRemarks;
    if (!list?.length) {
      return [];
    }
    return [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  formatRemarkDateTime(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    try {
      const loc = this.translate.currentLang === 'mr' ? 'mr-IN' : 'en-IN';
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

  statusMessage(app: CertificateApplicationDto): string {
    switch (app.status) {
      case 'PENDING_REVIEW':
      case 'SUBMITTED':
        return this.translate.instant('PROFILE.APP_PENDING_REVIEW');
      case 'PENDING_PAYMENT':
        return this.translate.instant('PROFILE.APP_PENDING_PAYMENT');
      case 'APPROVED':
        return this.translate.instant('CERTIFICATE_MY_APPLICATIONS.APPROVED_HINT');
      case 'REJECTED':
        return this.translate.instant('PROFILE.APP_REJECTED');
      case 'CANCELLED':
        return this.translate.instant('PROFILE.STATUS_CANCELLED');
      default:
        return this.statusLabel(app.status);
    }
  }

  closeCertModal(): void {
    document.body.classList.remove('certificate-issued-printing');
    this.certModalOpen = false;
    this.certModalLoading = false;
    this.certModalHtml = null;
    this.certModalNumber = '';
  }

  printIssuedCertificate(): void {
    document.body.classList.add('certificate-issued-printing');
    let finished = false;
    const cleanup = (): void => {
      if (finished) {
        return;
      }
      finished = true;
      document.body.classList.remove('certificate-issued-printing');
      window.removeEventListener('afterprint', cleanup);
      window.clearTimeout(fallbackTimer);
    };
    window.addEventListener('afterprint', cleanup);
    const fallbackTimer = window.setTimeout(cleanup, 4000);
    window.print();
  }

  async openCertificate(app: CertificateApplicationDto): Promise<void> {
    const citizenId = this.loggedInCitizen.getCurrentLoggedInCitizenId();
    if (!citizenId) {
      return;
    }
    this.certModalOpen = true;
    this.certModalLoading = true;
    this.certModalHtml = null;
    this.certModalNumber = app.applicationNumber;
    this.certLoadAppId = app.id;
    const lang = this.langForApi();
    try {
      const doc = await firstValueFrom(
        this.certificateApplications.getIssuedDocument(app.id, citizenId, lang)
      );
      this.certModalHtml = this.sanitizer.bypassSecurityTrustHtml(doc.html);
      if (doc.applicationNumber?.trim()) {
        this.certModalNumber = doc.applicationNumber.trim();
      }
    } catch (e: unknown) {
      this.closeCertModal();
      this.toast.show(this.certErrorMessage(e), 'error');
    } finally {
      this.certLoadAppId = null;
      this.certModalLoading = false;
    }
  }

  private langForApi(): string {
    const lang = this.translate.currentLang || this.translate.getDefaultLang();
    return lang === 'en' ? 'en' : 'mr';
  }

  private certErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 403) {
        return this.translate.instant('CERTIFICATE.ISSUED_ERR_FORBIDDEN');
      }
      if (err.status === 409) {
        return this.translate.instant('CERTIFICATE.ISSUED_ERR_NOT_APPROVED');
      }
      if (err.status === 404) {
        return this.translate.instant('CERTIFICATE.ISSUED_ERR_NOT_FOUND');
      }
    }
    return this.translate.instant('CERTIFICATE.ISSUED_ERR_GENERIC');
  }

  private isProgressStatus(s: CertificateApplicationStatus): boolean {
    return s === 'SUBMITTED' || s === 'PENDING_PAYMENT' || s === 'PENDING_REVIEW';
  }

  private matchesSegment(status: CertificateApplicationStatus): boolean {
    switch (this.segment) {
      case 'progress':
        return this.isProgressStatus(status);
      case 'approved':
        return status === 'APPROVED';
      case 'closed':
        return status === 'REJECTED' || status === 'CANCELLED';
      default:
        return true;
    }
  }
}
