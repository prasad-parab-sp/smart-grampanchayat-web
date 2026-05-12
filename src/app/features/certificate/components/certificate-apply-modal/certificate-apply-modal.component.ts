import { HttpErrorResponse } from '@angular/common/http';
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
import { CertificateApplicationService } from '../../../../core/certificate-application.service';
import type { CertificateApplicationSubmitRequest } from '../../../../core/certificate-application.models';
import type { CertificateTypeDto, CertificateTypeFieldDto } from '../../../../core/certificate-type.models';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
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
import { buildCertificateAdditionalValues } from '../../lib/certificate-application-payload';
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
  @Output() applied = new EventEmitter<{ applicationNumber: string }>();


  /** Inline message for login/API failures (may be translated locally or plain text from server). */
  applySubmitError: string | null = null;

  submitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly loggedInCitizen: LoggedInCitizenService,
    private readonly certificateApplicationService: CertificateApplicationService,
    private readonly translate: TranslateService,
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
      .filter((field) => field.dataType !== 'FILE')
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /** FILE dynamic rows for uploads panel. */
  get extraFileFields(): CertificateTypeFieldDto[] {
    return (this.selectedCertificate.extraFields ?? [])
      .filter((field) => field.dataType === 'FILE')
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

  trackExtraField(_index: number, field: CertificateTypeFieldDto): string {
    return field.fieldKey;
  }

  labelFor(field: CertificateTypeFieldDto): string {
    return certificateTypeFieldLabel(field, this.i18n.currentLang);
  }

  placeholderFor(field: CertificateTypeFieldDto): string {
    return certificateTypeFieldPlaceholder(field, this.i18n.currentLang);
  }

  helpFor(field: CertificateTypeFieldDto): string | null {
    return certificateTypeFieldHelpText(field, this.i18n.currentLang);
  }

  selectOptionsFor(field: CertificateTypeFieldDto): CertificateTypeFieldSelectOption[] {
    return certificateTypeFieldSelectOptions(field, this.i18n.currentLang);
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
    for (const extraField of this.selectedCertificate.extraFields ?? []) {
      if (extraField.dataType === 'FILE') {
        this.uploadedFilesByExtraFieldKey[extraField.fieldKey] = [];
      }
    }
    this.extraFieldErrors = {};
    this.applyFieldErrors = {};
    this.uploadErrorKey = null;
    this.applySubmitError = null;
    this.submitting = false;
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
    this.applySubmitError = null;

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

    const citizenId = this.loggedInCitizen.getCurrentLoggedInCitizenId()?.trim();
    if (!citizenId) {
      this.applySubmitError = this.translate.instant('CERTIFICATE.ERR_APPLY_LOGIN_REQUIRED');
      return;
    }

    const purposeLabel = this.translate.instant(raw.purpose).trim().slice(0, 200);
    const additional = buildCertificateAdditionalValues(this.selectedCertificate.extraFields, raw.extra ?? {});

    const payload: CertificateApplicationSubmitRequest = {
      certificateTypeId: this.selectedCertificate.id,
      applicantFullName: raw.name.trim(),
      applicantMobile: raw.phone.trim(),
      citizenId,
      reasonShort: purposeLabel,
      additionalValues: additional
    };
    const purposeDetails = raw.purposeDetails?.trim();
    if (purposeDetails) {
      payload.reasonDetails = purposeDetails;
    }
    const addressText = raw.address?.trim();
    if (addressText) {
      payload.addressText = addressText;
    }

    this.submitting = true;
    this.certificateApplicationService
      .submit(payload)
      .pipe(take(1))
      .subscribe({
        next: (dto) => {
          this.submitting = false;
          this.applied.emit({ applicationNumber: dto.applicationNumber });
        },
        error: (err: HttpErrorResponse) => {
          this.submitting = false;
          this.applySubmitError = this.formatSubmitError(err);
          this.cdr.markForCheck();
        }
      });
  }

  private formatSubmitError(err: HttpErrorResponse): string {
    const body = err.error as { message?: unknown } | null;
    if (body && typeof body.message === 'string' && body.message.trim()) {
      return body.message.trim();
    }
    if (err.status === 0) {
      return this.translate.instant('CERTIFICATE.ERR_APPLY_NETWORK');
    }
    return this.translate.instant('CERTIFICATE.ERR_APPLY_SUBMIT');
  }
}
