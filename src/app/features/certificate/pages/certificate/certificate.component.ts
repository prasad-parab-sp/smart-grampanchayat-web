import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  CERTIFICATE_CATALOG,
  CertificateCatalogRow,
  CertificateListItem,
  isCertificateSectionHeader
} from '../../data/certificate-catalog.data';
import { buildCertificateDisplayRows } from '../../lib/certificate-catalog-filter';
import { CERTIFICATE_FILTER_PRESETS } from '../../data/certificate-filters.data';
import { CertificateToolbarComponent } from '../../components/certificate-toolbar/certificate-toolbar.component';
import { CertificateCatalogListComponent } from '../../components/certificate-catalog-list/certificate-catalog-list.component';
import { CertificateSuchanaPeekComponent } from '../../components/certificate-suchana-peek/certificate-suchana-peek.component';
import { CertificatePageHeaderComponent } from '../../components/certificate-page-header/certificate-page-header.component';
import { CertificateToastComponent } from '../../components/certificate-toast/certificate-toast.component';
import { CertificateApplyModalComponent } from '../../components/certificate-apply-modal/certificate-apply-modal.component';
import { CertificateComplaintModalComponent } from '../../components/certificate-complaint-modal/certificate-complaint-modal.component';
import { CertificateSuchanaModalComponent } from '../../components/certificate-suchana-modal/certificate-suchana-modal.component';
import { collectFocusableElements } from '../../lib/modal-focusables';

/**
 * Certificates / services list with apply, complaint, and suggestion modals (stubs until API).
 */
@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    CertificatePageHeaderComponent,
    CertificateSuchanaPeekComponent,
    CertificateToastComponent,
    CertificateToolbarComponent,
    CertificateCatalogListComponent,
    CertificateApplyModalComponent,
    CertificateComplaintModalComponent,
    CertificateSuchanaModalComponent
  ],
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.scss']
})
export class CertificateComponent implements OnInit, OnDestroy {
  readonly rows = CERTIFICATE_CATALOG;
  readonly filterPresets = CERTIFICATE_FILTER_PRESETS;

  activeFilter = 'all';
  searchQuery = '';

  certificateApplyModalOpen = false;
  complaintOpen = false;
  suchanaOpen = false;

  selected: CertificateListItem | null = null;
  complaintSourceRow: CertificateListItem | null = null;

  submitMessage: string | null = null;

  private toastClearTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly destroy$ = new Subject<void>();
  private lastFocus: HTMLElement | null = null;

  @ViewChild(CertificateApplyModalComponent)
  private applyModal?: CertificateApplyModalComponent;
  @ViewChild(CertificateComplaintModalComponent)
  private complaintModal?: CertificateComplaintModalComponent;
  @ViewChild(CertificateSuchanaModalComponent)
  private suchanaModal?: CertificateSuchanaModalComponent;

  constructor(
    private readonly translate: TranslateService,
    private readonly route: ActivatedRoute
  ) {}

  get displayRows(): CertificateCatalogRow[] {
    return buildCertificateDisplayRows(
      this.rows,
      this.filterPresets,
      this.activeFilter,
      this.searchQuery,
      (key) => this.translate.instant(key)
    );
  }

  setFilter(id: string): void {
    this.activeFilter = id;
  }

  trackRow(_index: number, row: CertificateCatalogRow): string {
    if (isCertificateSectionHeader(row)) {
      return 'h:' + row.titleKey;
    }
    return 'i:' + (row as CertificateListItem).nameKey;
  }

  scrollToSuchanaBlock(): void {
    const el = document.getElementById('certificate-suchana-section');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  ngOnInit(): void {
    this.route.fragment.pipe(takeUntil(this.destroy$)).subscribe((f) => {
      if (f === 'suchana') {
        setTimeout(() => this.scrollToSuchanaBlock(), 120);
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  onDocKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (this.certificateApplyModalOpen) {
        e.preventDefault();
        this.closeApply();
      } else if (this.complaintOpen) {
        e.preventDefault();
        this.closeComplaint();
      } else if (this.suchanaOpen) {
        e.preventDefault();
        this.closeSuchana();
      }
      return;
    }

    if (e.key !== 'Tab' || !this.anyModalOpen) {
      return;
    }

    const panel = this.getActivePanel();
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

  private get anyModalOpen(): boolean {
    return this.certificateApplyModalOpen || this.complaintOpen || this.suchanaOpen;
  }

  private getActivePanel(): HTMLElement | null {
    if (this.certificateApplyModalOpen) {
      return this.applyModal?.panelRef?.nativeElement ?? null;
    }
    if (this.complaintOpen) {
      return this.complaintModal?.panelRef?.nativeElement ?? null;
    }
    if (this.suchanaOpen) {
      return this.suchanaModal?.panelRef?.nativeElement ?? null;
    }
    return null;
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
    document.body.style.overflow = this.anyModalOpen ? 'hidden' : '';
  }

  private focusModalClose(which: 'apply' | 'complaint' | 'suchana'): void {
    setTimeout(() => {
      const ref =
        which === 'apply'
          ? this.applyModal?.closeBtnRef
          : which === 'complaint'
            ? this.complaintModal?.closeBtnRef
            : this.suchanaModal?.closeBtnRef;
      ref?.nativeElement?.focus();
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
      this.toastClearTimer = null;
    }, 4500);
  }

  dismissToast(): void {
    this.clearToastTimer();
    this.submitMessage = null;
  }

  openRow(row: CertificateListItem): void {
    this.submitMessage = null;
    this.clearToastTimer();
    this.stashFocus();
    if (row.isComplaint) {
      this.complaintSourceRow = row;
      this.complaintOpen = true;
      this.syncBodyScrollLock();
      this.focusModalClose('complaint');
      return;
    }
    this.selected = row;
    this.certificateApplyModalOpen = true;
    this.syncBodyScrollLock();
    this.focusModalClose('apply');
  }

  closeApply(): void {
    this.certificateApplyModalOpen = false;
    this.selected = null;
    this.restoreFocus();
    this.syncBodyScrollLock();
  }

  closeComplaint(): void {
    this.complaintOpen = false;
    this.complaintSourceRow = null;
    this.restoreFocus();
    this.syncBodyScrollLock();
  }

  closeSuchana(): void {
    this.suchanaOpen = false;
    this.restoreFocus();
    this.syncBodyScrollLock();
  }

  openSuchana(): void {
    this.submitMessage = null;
    this.clearToastTimer();
    this.stashFocus();
    this.suchanaOpen = true;
    this.syncBodyScrollLock();
    this.focusModalClose('suchana');
  }

  onApplySubmitted(): void {
    this.submitMessage = 'CERTIFICATE.STUB_APPLY_ACK';
    this.certificateApplyModalOpen = false;
    this.selected = null;
    this.restoreFocus();
    this.syncBodyScrollLock();
    this.scheduleToastDismiss();
  }

  onComplaintSubmitted(): void {
    this.submitMessage = 'CERTIFICATE.STUB_COMPLAINT_ACK';
    this.complaintOpen = false;
    this.complaintSourceRow = null;
    this.restoreFocus();
    this.syncBodyScrollLock();
    this.scheduleToastDismiss();
  }

  onSuchanaSubmitted(): void {
    this.submitMessage = 'CERTIFICATE.STUB_SUCHANA_ACK';
    this.suchanaOpen = false;
    this.restoreFocus();
    this.syncBodyScrollLock();
    this.scheduleToastDismiss();
  }
}
