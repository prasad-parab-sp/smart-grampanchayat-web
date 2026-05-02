import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { prefillApplicantNameField } from '../../../../core/citizen-applicant-prefill';
import { CitizenService } from '../../../../core/citizen.service';
import { LoggedInCitizenService } from '../../../../core/logged-in-citizen.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../../../../i18n/i18n.service';
import { CertificateListItem } from '../../data/certificate-catalog.data';
import { CERTIFICATE_APPLY_PURPOSE_KEYS } from '../../data/certificate-form-options.data';
import {
  certificateCatalogDisplayDescription,
  certificateCatalogDisplayName,
  certificateCatalogExtraSectionTitle,
  certificateShowsCatalogDefaultVersusTenantFee
} from '../../lib/certificate-api-mapper';
import { validateCertificateApply } from '../../lib/certificate-form-validation';

@Component({
  selector: 'app-certificate-apply-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './certificate-apply-modal.component.html',
  styleUrls: ['../../styles/certificate-modal.shared.scss']
})
export class CertificateApplyModalComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) selected!: CertificateListItem;

  @Output() cancelled = new EventEmitter<void>();
  @Output() applied = new EventEmitter<void>();

  private readonly loggedInCitizen = inject(LoggedInCitizenService);
  private readonly citizenService = inject(CitizenService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly i18n = inject(I18nService);

  /** Modal title line uses API-aligned Mr/En names. */
  get selectedDisplayTitle(): string {
    return certificateCatalogDisplayName(this.selected, this.i18n.currentLang);
  }

  /** Lead copy from API descriptions. */
  get selectedDisplayDescription(): string {
    return certificateCatalogDisplayDescription(this.selected, this.i18n.currentLang);
  }

  /** Optional API heading ({@code extra_fields_section_title_*}) above applicant fields. */
  get selectedExtraSectionTitle(): string | null {
    return certificateCatalogExtraSectionTitle(this.selected, this.i18n.currentLang);
  }

  /** GP fee from nested tenant config differs from platform catalog default. */
  get showsCatalogDefaultVersusTenantFee(): boolean {
    return certificateShowsCatalogDefaultVersusTenantFee(this.selected);
  }

  readonly applyPurposeKeys = CERTIFICATE_APPLY_PURPOSE_KEYS;

  certificateApplicationForm = {
    name: '',
    phone: '',
    purpose: '',
    purposeDetails: '',
    address: ''
  };

  applyFieldErrors: Partial<Record<'name' | 'phone' | 'purpose', string | undefined>> = {};

  /** Shown when a chosen file exceeds 5 MB (master_fixed-3-2.html parity). */
  uploadErrorKey: string | null = null;

  readonly maxUploadBytes = 5 * 1024 * 1024;

  applyFiles: Record<string, File | null> = {};

  @ViewChild('panel', { read: ElementRef })
  panelRef?: ElementRef<HTMLElement>;
  @ViewChild('closeBtn', { read: ElementRef })
  closeBtnRef?: ElementRef<HTMLButtonElement>;

  ngOnInit(): void {
    prefillApplicantNameField(
      this.loggedInCitizen,
      this.citizenService,
      this.certificateApplicationForm,
      this.cdr
    );
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      if (!this.certificateApplicationForm.name?.trim()) {
        prefillApplicantNameField(
          this.loggedInCitizen,
          this.citizenService,
          this.certificateApplicationForm,
          this.cdr
        );
      }
    });
  }

  onBackdropClick(): void {
    this.cancelled.emit();
  }

  onPanelClick(ev: MouseEvent): void {
    ev.stopPropagation();
  }

  onApplyFile(uploadKey: string, ev: Event): void {
    const input = ev.target as HTMLInputElement;
    this.uploadErrorKey = null;
    const file = input.files?.[0] ?? null;
    if (file && file.size > this.maxUploadBytes) {
      this.uploadErrorKey = 'CERTIFICATE.ERR_UPLOAD_TOO_LARGE';
      input.value = '';
      this.applyFiles[uploadKey] = null;
      return;
    }
    this.applyFiles[uploadKey] = file;
  }

  close(): void {
    this.cancelled.emit();
  }

  submit(): void {
    const { ok, errors } = validateCertificateApply(this.certificateApplicationForm);
    this.applyFieldErrors = ok ? {} : errors;
    if (!ok) {
      return;
    }
    this.applied.emit();
  }
}
