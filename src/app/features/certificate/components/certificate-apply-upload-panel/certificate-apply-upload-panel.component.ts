import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { CertificateTypeFieldDto } from '../../../../core/certificate-type.models';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../../../../i18n/i18n.service';
import {
  certificateTypeFieldHelpText,
  certificateTypeFieldLabel,
  certificateTypeFieldPlaceholder
} from '../../lib/certificate-api-mapper';

export interface CertificateApplyUploadSlotResult {
  fieldKey: string;
  files: File[];
  /** When set, files should be empty and shown as panel-level error. */
  uploadErrorKey: string | null;
}

@Component({
  selector: 'app-certificate-apply-upload-panel',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './certificate-apply-upload-panel.component.html',
  styleUrls: ['../../styles/certificate-modal.shared.scss']
})
export class CertificateApplyUploadPanelComponent {
  @Input({ required: true }) fileFields!: CertificateTypeFieldDto[];

  /** Bound reference; parent owns state. Emits updates via {@link slotChange}. */
  @Input({ required: true }) filesByKey!: Record<string, File[]>;

  /** Validation messages per {@link CertificateTypeFieldDto#fieldKey} (e.g. required file). */
  @Input() fieldErrors: Record<string, string> = {};

  @Input() uploadErrorKey: string | null = null;

  @Output() slotChange = new EventEmitter<CertificateApplyUploadSlotResult>();

  constructor(readonly i18n: I18nService) {}

  readonly maxUploadBytes = 5 * 1024 * 1024;

  trackExtraField(_index: number, field: CertificateTypeFieldDto): string {
    return field.fieldKey;
  }

  labelFor(field: CertificateTypeFieldDto): string {
    return certificateTypeFieldLabel(field, this.i18n.currentLang);
  }

  placeholderFor(field: CertificateTypeFieldDto): string | null {
    const p = certificateTypeFieldPlaceholder(field, this.i18n.currentLang)?.trim();
    return p ? p : null;
  }

  helpFor(field: CertificateTypeFieldDto): string | null {
    return certificateTypeFieldHelpText(field, this.i18n.currentLang);
  }

  fileAccept(field: CertificateTypeFieldDto): string {
    const csv = field.allowedMimeCsv?.trim();
    if (!csv) {
      return 'image/*,.pdf';
    }
    return csv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .join(',');
  }

  private effectiveMaxBytes(field: CertificateTypeFieldDto): number {
    const n = field.maxBytes != null ? Number(field.maxBytes) : NaN;
    if (Number.isFinite(n) && n > 0) {
      return n;
    }
    return this.maxUploadBytes;
  }

  onFileSelected(field: CertificateTypeFieldDto, ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const maxFiles = field.maxFiles ?? 1;
    const maxBytes = this.effectiveMaxBytes(field);
    const picked = Array.from(input.files ?? []).slice(0, maxFiles);

    for (const file of picked) {
      if (file.size > maxBytes) {
        input.value = '';
        this.slotChange.emit({
          fieldKey: field.fieldKey,
          files: [],
          uploadErrorKey: 'CERTIFICATE.ERR_UPLOAD_TOO_LARGE'
        });
        return;
      }
    }

    this.slotChange.emit({
      fieldKey: field.fieldKey,
      files: picked,
      uploadErrorKey: null
    });
  }
}
