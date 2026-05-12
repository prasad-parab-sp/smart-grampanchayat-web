import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CERTIFICATE_API_FILTER_PRESETS } from '../../data/certificate-filters.data';
import { buildCertificateDisplayRows } from '../../lib/certificate-catalog-filter';
import { sortAndFilterCertificateTypesForCatalog } from '../../lib/certificate-api-mapper';
import { CertificateTypeService } from '../../../../core/certificate-type.service';
import { CertificateTypeDto } from '../../../../core/certificate-type.models';
import { I18nService } from '../../../../i18n/i18n.service';
import { CertificateToolbarComponent } from '../../components/certificate-toolbar/certificate-toolbar.component';
import { CertificateCatalogListComponent } from '../../components/certificate-catalog-list/certificate-catalog-list.component';
import { CertificatePageHeaderComponent } from '../../components/certificate-page-header/certificate-page-header.component';
import { CertificateSuggestionsPeekComponent } from '../../components/certificate-suggestions-peek/certificate-suggestions-peek.component';
import { CertificateToastComponent } from '../../components/certificate-toast/certificate-toast.component';
import { CertificateApplyModalComponent } from '../../components/certificate-apply-modal/certificate-apply-modal.component';
import { CertificateMyIssuedPanelComponent } from '../../components/certificate-my-issued-panel/certificate-my-issued-panel.component';
import { collectFocusableElements } from '../../lib/modal-focusables';

/**
 * Certificates / services list from {@code GET /api/certificate-types}; apply modal for a selected type.
 */
@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    CertificatePageHeaderComponent,
    CertificateSuggestionsPeekComponent,
    CertificateToastComponent,
    CertificateToolbarComponent,
    CertificateCatalogListComponent,
    CertificateApplyModalComponent,
    CertificateMyIssuedPanelComponent
  ],
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.scss']
})
export class CertificateComponent implements OnInit, OnDestroy {
  rows: CertificateTypeDto[] = [];
  readonly filterPresets = CERTIFICATE_API_FILTER_PRESETS;

  catalogLoading = false;
  catalogErrorKey: string | null = null;

  private apiTypes: CertificateTypeDto[] = [];

  activeFilter = 'all';
  searchQuery = '';

  certificateApplyModalOpen = false;

  selectedCertificate: CertificateTypeDto | null = null;

  submitMessage: string | null = null;

  submitToastParams: Record<string, unknown> | null = null;

  private toastClearTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly destroy$ = new Subject<void>();
  private lastFocus: HTMLElement | null = null;

  @ViewChild(CertificateApplyModalComponent)
  private applyModal?: CertificateApplyModalComponent;

  @ViewChild(CertificateMyIssuedPanelComponent)
  private issuedPanel?: CertificateMyIssuedPanelComponent;

  constructor(
    private readonly translate: TranslateService,
    private readonly certificateTypeService: CertificateTypeService,
    private readonly i18n: I18nService
  ) {}

  get displayRows(): CertificateTypeDto[] {
    return buildCertificateDisplayRows(
      this.rows,
      this.filterPresets,
      this.activeFilter,
      this.searchQuery,
      this.i18n.currentLang
    );
  }

  setFilter(id: string): void {
    this.activeFilter = id;
  }

  trackRow(_index: number, row: CertificateTypeDto): string {
    return 't:' + row.id;
  }

  ngOnInit(): void {
    this.loadCertificateCatalog();
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.rebuildRowsFromApiTypes();
    });
  }

  private loadCertificateCatalog(): void {
    this.catalogLoading = true;
    this.catalogErrorKey = null;
    this.certificateTypeService.list().pipe(takeUntil(this.destroy$)).subscribe({
      next: (types) => {
        this.apiTypes = types;
        this.rebuildRowsFromApiTypes();
        this.catalogLoading = false;
      },
      error: () => {
        this.apiTypes = [];
        this.rows = [];
        this.catalogErrorKey = 'CERTIFICATE.LOAD_ERROR';
        this.catalogLoading = false;
      }
    });
  }

  private rebuildRowsFromApiTypes(): void {
    // See {@link sortAndFilterCertificateTypesForCatalog}.
    this.rows = sortAndFilterCertificateTypesForCatalog(this.apiTypes);
  }

  @HostListener('document:keydown', ['$event'])
  onDocKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (this.certificateApplyModalOpen) {
        e.preventDefault();
        this.closeApply();
      }
      return;
    }

    if (e.key !== 'Tab' || !this.certificateApplyModalOpen) {
      return;
    }

    const panel = this.applyModal?.panelRef?.nativeElement ?? null;
    if (!panel) {
      return;
    }

    const focusables = collectFocusableElements(panel);
    if (focusables.length === 0) {
      return;
    }

    const active = document.activeElement;
    if (active && !panel.contains(active)) {
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (active === first || !panel.contains(active as Node)) {
        last.focus();
        e.preventDefault();
      }
    } else if (active === last) {
      first.focus();
      e.preventDefault();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.body.style.overflow = '';
    this.clearToastTimer();
  }

  private stashFocus(): void {
    const el = document.activeElement;
    this.lastFocus = el instanceof HTMLElement ? el : null;
  }

  private restoreFocus(): void {
    const el = this.lastFocus;
    this.lastFocus = null;
    if (el && typeof el.focus === 'function') {
      queueMicrotask(() => el.focus());
    }
  }

  private syncBodyScrollLock(): void {
    document.body.style.overflow = this.certificateApplyModalOpen ? 'hidden' : '';
  }

  private focusModalClose(): void {
    setTimeout(() => {
      this.applyModal?.closeBtnRef?.nativeElement?.focus();
    }, 0);
  }

  private clearToastTimer(): void {
    if (this.toastClearTimer) {
      clearTimeout(this.toastClearTimer);
      this.toastClearTimer = null;
    }
  }

  private scheduleToastDismiss(): void {
    this.clearToastTimer();
    this.toastClearTimer = setTimeout(() => {
      this.submitMessage = null;
      this.submitToastParams = null;
      this.toastClearTimer = null;
    }, 4500);
  }

  dismissToast(): void {
    this.clearToastTimer();
    this.submitMessage = null;
    this.submitToastParams = null;
  }

  openRow(row: CertificateTypeDto): void {
    this.submitMessage = null;
    this.submitToastParams = null;
    this.clearToastTimer();
    this.stashFocus();
    this.selectedCertificate = row;
    this.certificateApplyModalOpen = true;
    this.syncBodyScrollLock();
    this.focusModalClose();
  }

  closeApply(): void {
    this.certificateApplyModalOpen = false;
    this.selectedCertificate = null;
    this.restoreFocus();
    this.syncBodyScrollLock();
  }

  onApplySubmitted(ev: { applicationNumber: string }): void {
    this.submitMessage = 'CERTIFICATE.APPLY_SUCCESS_ACK';
    this.submitToastParams = { number: ev.applicationNumber };
    this.certificateApplyModalOpen = false;
    this.selectedCertificate = null;
    this.restoreFocus();
    this.syncBodyScrollLock();
    this.scheduleToastDismiss();
    this.issuedPanel?.refresh();
  }
}
