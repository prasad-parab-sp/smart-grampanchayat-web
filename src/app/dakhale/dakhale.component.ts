import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  DAKHALA_TYPES,
  DakhalaTypeItem,
  isDakhalaHeader
} from './dakhale-types.data';

/**
 * Certificates / services list with apply, complaint, and suggestion modals (stubs until API).
 */
@Component({
  selector: 'app-dakhale',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './dakhale.component.html',
  styleUrls: ['./dakhale.component.scss']
})
export class DakhaleComponent implements OnDestroy {
  /** Static catalog rows (headers + certificate/service items); replace with API when available. */
  readonly rows = DAKHALA_TYPES;

  /** Exposed to the template so `*ngIf="isDakhalaHeader(row)"` stays readable. */
  readonly isDakhalaHeader = isDakhalaHeader;

  /** `true` while the certificate-application modal is open. */
  certificateApplyModalOpen = false;

  /** `true` while the complaint modal is open. */
  complaintOpen = false;

  /** `true` while the suggestion (suchana) modal is open. */
  suchanaOpen = false;

  /** Row driving the apply modal (fee, doc list, `extraFields` id for future forms). */
  selected: DakhalaTypeItem | null = null;

  /** Two-way bound fields for the certificate apply modal (`ngModel`). */
  certificateApplicationForm = {
    name: '',
    phone: '',
    purpose: '',
    address: ''
  };

  /** Two-way bound fields for the complaint modal. */
  complaintForm = {
    name: '',
    phone: '',
    subject: '',
    location: '',
    details: ''
  };

  /** Two-way bound fields for the suggestion modal. */
  suchanaForm = {
    name: '',
    phone: '',
    category: '',
    details: '',
    benefit: ''
  };

  /**
   * When set, shows a translated toast (`submitMessage | translate`). Cleared when opening a flow again.
   * Values are i18n keys (e.g. `DAKHALE.STUB_APPLY_ACK`).
   */
  submitMessage: string | null = null;

  /** Close (✕) buttons — focus targets after `*ngIf` renders each modal. */
  @ViewChild('certificateApplyModalCloseBtn')
  private certificateApplyModalCloseBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('complaintCloseBtn') private complaintCloseBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('suchanaCloseBtn') private suchanaCloseBtn?: ElementRef<HTMLButtonElement>;

  /** Dialog panel roots — used for Tab focus trapping and resolving the active modal. */
  @ViewChild('certificateApplyModalPanel')
  private certificateApplyModalPanel?: ElementRef<HTMLElement>;
  @ViewChild('complaintPanel') private complaintPanel?: ElementRef<HTMLElement>;
  @ViewChild('suchanaPanel') private suchanaPanel?: ElementRef<HTMLElement>;

  /** Element that had focus immediately before the current modal opened (restored on close). */
  private lastFocus: HTMLElement | null = null;

  /** ngx-translate keys for the apply form “purpose” `<select>` (`[value]` is the key). */
  readonly applyPurposeKeys = [
    'DAKHALE.PURPOSE.GOVERNMENT',
    'DAKHALE.PURPOSE.BANK',
    'DAKHALE.PURPOSE.SCHOOL',
    'DAKHALE.PURPOSE.SCHOLARSHIP',
    'DAKHALE.PURPOSE.PERSONAL',
    'DAKHALE.PURPOSE.COURT',
    'DAKHALE.PURPOSE.OTHER'
  ];

  /** ngx-translate keys for the complaint “subject” `<select>`. */
  readonly complaintSubjectKeys = [
    'DAKHALE.COMPLAINT_SUBJ.ROAD',
    'DAKHALE.COMPLAINT_SUBJ.WATER',
    'DAKHALE.COMPLAINT_SUBJ.SANITATION',
    'DAKHALE.COMPLAINT_SUBJ.STREETLIGHT',
    'DAKHALE.COMPLAINT_SUBJ.DRAIN',
    'DAKHALE.COMPLAINT_SUBJ.PROPERTY_DAMAGE',
    'DAKHALE.COMPLAINT_SUBJ.UNAUTH_BUILD',
    'DAKHALE.COMPLAINT_SUBJ.CORRUPTION',
    'DAKHALE.COMPLAINT_SUBJ.OTHER'
  ];

  /** ngx-translate keys for the suggestion “category” `<select>`. */
  readonly suchanaCategoryKeys = [
    'DAKHALE.SUCHANA_CAT.DEV_PLAN',
    'DAKHALE.SUCHANA_CAT.WATER_IMPROVE',
    'DAKHALE.SUCHANA_CAT.ENV_TREE',
    'DAKHALE.SUCHANA_CAT.HEALTH',
    'DAKHALE.SUCHANA_CAT.EDUCATION',
    'DAKHALE.SUCHANA_CAT.POWER_LIGHT',
    'DAKHALE.SUCHANA_CAT.FARM_IRRIG',
    'DAKHALE.SUCHANA_CAT.WOMEN_CHILD',
    'DAKHALE.SUCHANA_CAT.SPORTS',
    'DAKHALE.SUCHANA_CAT.OTHER'
  ];

  /**
   * Handles global keyboard behavior while modals may be open: Escape closes the top modal;
   * Tab / Shift+Tab keeps focus cycling inside the active dialog panel.
   */
  @HostListener('document:keydown', ['$event'])
  onDocKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      // One handler for all modals; order matches visual “stack” (only one is open at a time).
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

    if (e.key !== 'Tab' || !this.anyModalOpen) return;

    const panel = this.getActivePanel();
    if (!panel) return;

    const focusables = this.collectFocusables(panel);
    if (focusables.length === 0) return;

    const active = document.activeElement;
    // Focus is still on the page behind the modal — do not intercept Tab.
    if (active && !panel.contains(active)) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      // From first focusable (or stray focus), wrap to last so focus stays inside the dialog.
      if (active === first || !panel.contains(active as Node)) {
        last.focus();
        e.preventDefault();
      }
    } else if (active === last) {
      first.focus();
      e.preventDefault();
    }
  }

  /** Clears body scroll lock if the component is destroyed while a modal was open. */
  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  /** `true` when any of the three modals is visible. */
  private get anyModalOpen(): boolean {
    return this.certificateApplyModalOpen || this.complaintOpen || this.suchanaOpen;
  }

  /**
   * Root element of the currently open modal.
   * @returns Panel host, or `null` if no modal is open
   */
  private getActivePanel(): HTMLElement | null {
    if (this.certificateApplyModalOpen) return this.certificateApplyModalPanel?.nativeElement ?? null;
    if (this.complaintOpen) return this.complaintPanel?.nativeElement ?? null;
    if (this.suchanaOpen) return this.suchanaPanel?.nativeElement ?? null;
    return null;
  }

  /**
   * Lists visible, tabbable elements inside `root` (for focus trapping).
   * @param root - Modal panel element
   * @returns Focusable controls in DOM order
   */
  private collectFocusables(root: HTMLElement): HTMLElement[] {
    const sel =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(root.querySelectorAll<HTMLElement>(sel)).filter((el) => {
      if (el.tabIndex < 0) return false;
      if (el.hasAttribute('disabled')) return false;
      // Skip elements with no layout box (e.g. `display: none`) so Tab order stays valid.
      return el.getClientRects().length > 0;
    });
  }

  /** Remembers the focused element before opening a modal so it can be restored on close. */
  private stashFocus(): void {
    const el = document.activeElement;
    this.lastFocus = el instanceof HTMLElement ? el : null;
  }

  /** Moves focus back to the element saved by `stashFocus` when the modal opened. */
  private restoreFocus(): void {
    const el = this.lastFocus;
    this.lastFocus = null;
    if (el && typeof el.focus === 'function') {
      // Defer until after Angular removes the modal from the DOM so the old target can receive focus.
      queueMicrotask(() => el.focus());
    }
  }

  /** Sets `overflow: hidden` on `document.body` while any modal is open. */
  private syncBodyScrollLock(): void {
    // Stops the page behind a full-screen backdrop from scrolling on mobile while a dialog is open.
    document.body.style.overflow = this.anyModalOpen ? 'hidden' : '';
  }

  /**
   * Moves initial focus to the active modal’s close (✕) control after the view updates.
   * @param which - Which modal was just opened
   */
  private focusModalClose(which: 'apply' | 'complaint' | 'suchana'): void {
    // `ViewChild` is populated after `*ngIf` renders; next macrotask runs after that CD cycle.
    setTimeout(() => {
      const ref =
        which === 'apply'
          ? this.certificateApplyModalCloseBtn
          : which === 'complaint'
            ? this.complaintCloseBtn
            : this.suchanaCloseBtn;
      ref?.nativeElement?.focus();
    }, 0);
  }

  /**
   * Opens the certificate apply modal, complaint modal, or no-ops for section headers.
   * @param row - Catalog row (header or actionable item)
   */
  openRow(row: (typeof DAKHALA_TYPES)[number]) {
    if (isDakhalaHeader(row)) return;
    this.submitMessage = null;
    this.stashFocus();
    // Complaint is a separate modal; every other row opens the certificate apply flow.
    if (row.isComplaint) {
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

  /** Closes the certificate apply modal and clears the selected row. */
  closeApply(): void {
    this.certificateApplyModalOpen = false;
    this.selected = null;
    this.restoreFocus();
    this.syncBodyScrollLock();
  }

  /** Closes the complaint modal. */
  closeComplaint(): void {
    this.complaintOpen = false;
    this.restoreFocus();
    this.syncBodyScrollLock();
  }

  /** Closes the suggestion (suchana) modal. */
  closeSuchana(): void {
    this.suchanaOpen = false;
    this.restoreFocus();
    this.syncBodyScrollLock();
  }

  /** Opens the suggestion modal from the suggestion card CTA. */
  openSuchana(): void {
    this.submitMessage = null;
    this.stashFocus();
    this.suchanaOpen = true;
    this.syncBodyScrollLock();
    this.focusModalClose('suchana');
  }

  /** Placeholder submit: shows a toast and closes the apply modal (replace with API call). */
  submitApplyStub(): void {
    this.submitMessage = 'DAKHALE.STUB_APPLY_ACK';
    this.closeApply();
  }

  /** Placeholder submit: shows a toast and closes the complaint modal (replace with API call). */
  submitComplaintStub(): void {
    this.submitMessage = 'DAKHALE.STUB_COMPLAINT_ACK';
    this.closeComplaint();
  }

  /** Placeholder submit: shows a toast and closes the suggestion modal (replace with API call). */
  submitSuchanaStub(): void {
    this.submitMessage = 'DAKHALE.STUB_SUCHANA_ACK';
    this.closeSuchana();
  }
}
