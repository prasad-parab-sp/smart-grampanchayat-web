import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CertificateListItem } from '../../data/certificate-catalog.data';
import { CERTIFICATE_APPLY_PURPOSE_KEYS } from '../../data/certificate-form-options.data';
import { validateCertificateApply } from '../../lib/certificate-form-validation';

@Component({
  selector: 'app-certificate-apply-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './certificate-apply-modal.component.html',
  styleUrls: ['../../styles/certificate-modal.shared.scss']
})
export class CertificateApplyModalComponent {
  @Input({ required: true }) selected!: CertificateListItem;

  @Output() cancelled = new EventEmitter<void>();
  @Output() applied = new EventEmitter<void>();

  readonly applyPurposeKeys = CERTIFICATE_APPLY_PURPOSE_KEYS;

  certificateApplicationForm = {
    name: '',
    phone: '',
    purpose: '',
    address: ''
  };

  applyFieldErrors: Partial<Record<'name' | 'phone' | 'purpose', string | undefined>> = {};

  applyFiles: Record<string, File | null> = {};

  @ViewChild('panel', { read: ElementRef })
  panelRef?: ElementRef<HTMLElement>;
  @ViewChild('closeBtn', { read: ElementRef })
  closeBtnRef?: ElementRef<HTMLButtonElement>;

  onBackdropClick(): void {
    this.cancelled.emit();
  }

  onPanelClick(ev: MouseEvent): void {
    ev.stopPropagation();
  }

  onApplyFile(uploadKey: string, ev: Event): void {
    const input = ev.target as HTMLInputElement;
    this.applyFiles[uploadKey] = input.files?.[0] ?? null;
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
