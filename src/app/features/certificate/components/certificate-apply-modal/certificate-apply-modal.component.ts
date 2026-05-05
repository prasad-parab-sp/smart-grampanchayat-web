import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { LoggedInCitizenService } from '../../../../core/logged-in-citizen.service';
import type { CertificateTypeDto, CertificateTypeFieldDto } from '../../../../core/certificate-type.models';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../../../../i18n/i18n.service';
import { CERTIFICATE_APPLY_PURPOSE_KEYS } from '../../data/certificate-form-options.data';
import {
  certificateCatalogDisplayDescription,
  certificateCatalogDisplayName,
  certificateCatalogExtraSectionTitle,
  certificateShowsCatalogDefaultVersusTenantFee,
  certificateTypeFieldHelpText,
  certificateTypeFieldLabel,
  certificateTypeFieldPlaceholder,
  certificateTypeFieldSelectOptions,
  type CertificateTypeFieldSelectOption
} from '../../lib/certificate-api-mapper';
import {
  type CertificateApplyFormModel,
  validateCertificateApply,
  validateCertificateTypeExtraFields
} from '../../lib/certificate-form-validation';
import {
  CertificateApplyUploadPanelComponent,
  type CertificateApplyUploadSlotResult
} from '../certificate-apply-upload-panel/certificate-apply-upload-panel.component';

@Component({
  selector: 'app-certificate-apply-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, CertificateApplyUploadPanelComponent],
  templateUrl: './certificate-apply-modal.component.html',
  styleUrls: ['../../styles/certificate-modal.shared.scss']
})
export class CertificateApplyModalComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) selectedCertificate!: CertificateTypeDto;

  @Output() cancelled = new EventEmitter<void>();
  @Output() applied = new EventEmitter<void>();


  constructor(
    private readonly fb: FormBuilder,
    private readonly loggedInCitizen: LoggedInCitizenService,
    private readonly cdr: ChangeDetectorRef,
    readonly i18n: I18nService
  ) {}

  /** Modal title line uses API-aligned Mr/En names. */
  get selectedDisplayTitle(): string {
    return certificateCatalogDisplayName(this.selectedCertificate, this.i18n.currentLang);
  }

  /** Lead copy from API descriptions. */
  get selectedDisplayDescription(): string {
    return certificateCatalogDisplayDescription(this.selectedCertificate, this.i18n.currentLang);
  }

  /** Optional API heading ({@code extra_fields_section_title_*}) for the extra-fields card. */
  get selectedExtraSectionTitle(): string | null {
    return certificateCatalogExtraSectionTitle(this.selectedCertificate, this.i18n.currentLang);
  }

  /** GP fee from nested tenant config differs from platform catalog default. */
  get showsCatalogDefaultVersusTenantFee(): boolean {
    return certificateShowsCatalogDefaultVersusTenantFee(this.selectedCertificate);
  }

  /** Non-FILE dynamic rows from {@code CertificateTypeDto.extraFields}, sorted. */
  get extraInputFields(): CertificateTypeFieldDto[] {
    return (this.selectedCertificate.extraFields ?? [])
      .filter((f) => f.dataType !== 'FILE')
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /** FILE dynamic rows for uploads panel. */
  get extraFileFields(): CertificateTypeFieldDto[] {
    return (this.selectedCertificate.extraFields ?? [])
      .filter((f) => f.dataType === 'FILE')
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /** Extra-fields card (master {@code renderExtraFields} parity): any API-defined inputs or file slots. */
  get hasCertificateExtraFieldsSection(): boolean {
    return this.extraInputFields.length > 0 || this.extraFileFields.length > 0;
  }

  readonly applyPurposeKeys = CERTIFICATE_APPLY_PURPOSE_KEYS;

  /**
   * Applicant fields + nested {@code extra} group (API-driven non-FILE keys). Built in {@link rebuildApplyForm}.
   */
  applyForm!: FormGroup;

  /** Selected files for API {@code extraFields} with {@code dataType === 'FILE'}; key = {@link CertificateTypeFieldDto#fieldKey}. */
  uploadedFilesByExtraFieldKey: Record<string, File[]> = {};

  applyFieldErrors: Partial<Record<'name' | 'phone' | 'purpose', string | undefined>> = {};

  extraFieldErrors: Record<string, string> = {};

  /** Shown when a chosen file exceeds the effective limit for that slot. */
  uploadErrorKey: string | null = null;

  @ViewChild('panel', { read: ElementRef })
  panelRef?: ElementRef<HTMLElement>;
  @ViewChild('closeBtn', { read: ElementRef })
  closeBtnRef?: ElementRef<HTMLButtonElement>;

  ngOnInit(): void {
    this.rebuildApplyForm();
    this.prefillApplicantNameFromBadge();
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.prefillApplicantNameFromBadge());
  }

  trackExtraField(_index: number, f: CertificateTypeFieldDto): string {
    return f.fieldKey;
  }

  labelFor(f: CertificateTypeFieldDto): string {
    return certificateTypeFieldLabel(f, this.i18n.currentLang);
  }

  placeholderFor(f: CertificateTypeFieldDto): string {
    return certificateTypeFieldPlaceholder(f, this.i18n.currentLang);
  }

  helpFor(f: CertificateTypeFieldDto): string | null {
    return certificateTypeFieldHelpText(f, this.i18n.currentLang);
  }

  selectOptionsFor(f: CertificateTypeFieldDto): CertificateTypeFieldSelectOption[] {
    return certificateTypeFieldSelectOptions(f, this.i18n.currentLang);
  }

  /** Header badge (login / shell hydration) → applicant name when still empty. */
  private prefillApplicantNameFromBadge(): void {
    const nameCtrl = this.applyForm?.get('name');
    if (!nameCtrl) {
      return;
    }
    if ((nameCtrl.value ?? '').trim()) {
      return;
    }
    const name = this.loggedInCitizen.getBadgeDisplayName()?.trim();
    if (name) {
      nameCtrl.setValue(name);
      this.cdr.markForCheck();
    }
  }

  private rebuildApplyForm(): void {
    const extraControls: Record<string, FormControl<string>> = {};
    for (const extraField of this.selectedCertificate.extraFields ?? []) {
      if (extraField.dataType !== 'FILE') {
        extraControls[extraField.fieldKey] = this.fb.nonNullable.control('');
      }
    }

    this.applyForm = this.fb.group({
      name: this.fb.nonNullable.control(''),
      phone: this.fb.nonNullable.control(''),
      purpose: this.fb.nonNullable.control(''),
      purposeDetails: this.fb.nonNullable.control(''),
      address: this.fb.nonNullable.control(''),
      extra: this.fb.group(extraControls)
    });

    this.uploadedFilesByExtraFieldKey = {};
    for (const f of this.selectedCertificate.extraFields ?? []) {
      if (f.dataType === 'FILE') {
        this.uploadedFilesByExtraFieldKey[f.fieldKey] = [];
      }
    }
    this.extraFieldErrors = {};
    this.applyFieldErrors = {};
    this.uploadErrorKey = null;
  }

  onBackdropClick(): void {
    this.cancelled.emit();
  }

  onPanelClick(ev: MouseEvent): void {
    ev.stopPropagation();
  }

  onUploadSlotChange(e: CertificateApplyUploadSlotResult): void {
    if (e.uploadErrorKey) {
      this.uploadErrorKey = e.uploadErrorKey;
    } else {
      this.uploadErrorKey = null;
      const next = { ...this.extraFieldErrors };
      delete next[e.fieldKey];
      this.extraFieldErrors = next;
    }
    this.uploadedFilesByExtraFieldKey = {
      ...this.uploadedFilesByExtraFieldKey,
      [e.fieldKey]: e.files
    };
  }

  close(): void {
    this.cancelled.emit();
  }

  submit(): void {
    const raw = this.applyForm.getRawValue() as {
      name: string;
      phone: string;
      purpose: string;
      purposeDetails: string;
      address: string;
      extra: Record<string, string>;
    };
    const formModel: CertificateApplyFormModel = {
      name: raw.name,
      phone: raw.phone,
      purpose: raw.purpose,
      purposeDetails: raw.purposeDetails,
      address: raw.address
    };
    const { ok, errors } = validateCertificateApply(formModel);
    this.applyFieldErrors = ok ? {} : errors;

    const dyn = validateCertificateTypeExtraFields(
      this.selectedCertificate.extraFields,
      raw.extra ?? {},
      this.uploadedFilesByExtraFieldKey
    );
    this.extraFieldErrors = dyn.ok ? {} : dyn.errors;

    if (!ok || !dyn.ok) {
      return;
    }
    this.applied.emit();
  }
}
