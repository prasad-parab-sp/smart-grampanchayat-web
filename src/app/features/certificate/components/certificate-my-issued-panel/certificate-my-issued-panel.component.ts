import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { CertificateApplicationService } from '../../../../core/certificate-application.service';
import { CertificateApplicationDto } from '../../../../core/certificate-application.models';
import { CertificateTypeService } from '../../../../core/certificate-type.service';
import { CertificateTypeDto } from '../../../../core/certificate-type.models';
import { LoggedInCitizenService } from '../../../../core/logged-in-citizen.service';
import { ToastService } from '../../../../core/toast.service';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-certificate-my-issued-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './certificate-my-issued-panel.component.html',
  styleUrls: ['./certificate-my-issued-panel.component.scss']
})
export class CertificateMyIssuedPanelComponent implements OnInit {
  /** Panel hidden when no citizen session. */
  visible = false;
  loading = false;
  loadError = false;
  issued: CertificateApplicationDto[] = [];

  expanded = false;
  filterText = '';
  visibleLimit = PAGE_SIZE;

  certModalOpen = false;
  certModalLoading = false;
  certModalHtml: SafeHtml | null = null;
  certModalNumber = '';
  certLoadAppId: string | null = null;

  private typeById = new Map<string, CertificateTypeDto>();

  constructor(
    private readonly loggedInCitizen: LoggedInCitizenService,
    private readonly certificateApplicationService: CertificateApplicationService,
    private readonly certificateTypeService: CertificateTypeService,
    private readonly translate: TranslateService,
    private readonly toast: ToastService,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    void this.load();
  }

  /** Call after a new application is submitted so counts stay fresh when it is later approved. */
  refresh(): void {
    void this.load();
  }

  get filteredIssued(): CertificateApplicationDto[] {
    const q = this.filterText.trim().toLowerCase();
    if (!q) {
      return this.issued;
    }
    return this.issued.filter((app) => {
      const label = this.certificateTypeLabel(app.certificateTypeId).toLowerCase();
      const num = app.applicationNumber.toLowerCase();
      return label.includes(q) || num.includes(q);
    });
  }

  get pagedIssued(): CertificateApplicationDto[] {
    return this.filteredIssued.slice(0, this.visibleLimit);
  }

  get hasMore(): boolean {
    return this.pagedIssued.length < this.filteredIssued.length;
  }

  get showingFrom(): number {
    return this.filteredIssued.length === 0 ? 0 : 1;
  }

  get showingTo(): number {
    return this.pagedIssued.length;
  }

  get filteredTotal(): number {
    return this.filteredIssued.length;
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  onFilterInput(): void {
    this.visibleLimit = PAGE_SIZE;
  }

  loadMore(): void {
    this.visibleLimit += PAGE_SIZE;
  }

  async load(): Promise<void> {
    const citizenId = this.loggedInCitizen.getCurrentLoggedInCitizenId();
    if (!citizenId) {
      this.visible = false;
      return;
    }
    this.visible = true;
    this.loading = true;
    this.loadError = false;
    try {
      const [types, apps] = await Promise.all([
        firstValueFrom(this.certificateTypeService.list()),
        firstValueFrom(this.certificateApplicationService.list(citizenId, 'APPROVED'))
      ]);
      this.typeById = new Map(types.map((t) => [t.id, t]));
      this.issued = apps ?? [];
      this.visibleLimit = PAGE_SIZE;
    } catch {
      this.typeById = new Map();
      this.issued = [];
      this.loadError = true;
      this.toast.show(this.translate.instant('CERTIFICATE.ISSUED_ERR_LIST'), 'error');
    } finally {
      this.loading = false;
    }
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
        this.certificateApplicationService.getIssuedDocument(app.id, citizenId, lang)
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

  trackByApp(_i: number, app: CertificateApplicationDto): string {
    return app.id;
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
}
