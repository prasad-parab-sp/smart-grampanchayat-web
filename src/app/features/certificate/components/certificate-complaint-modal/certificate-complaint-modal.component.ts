import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CertificateListItem } from '../../data/certificate-catalog.data';
import { CERTIFICATE_COMPLAINT_SUBJECT_KEYS } from '../../data/certificate-form-options.data';
import { validateCertificateComplaint } from '../../lib/certificate-form-validation';

@Component({
  selector: 'app-certificate-complaint-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './certificate-complaint-modal.component.html',
  styleUrls: ['../../styles/certificate-modal.shared.scss']
})
export class CertificateComplaintModalComponent {
  @Input({ required: true }) sourceRow!: CertificateListItem;

  @Output() cancelled = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  readonly complaintSubjectKeys = CERTIFICATE_COMPLAINT_SUBJECT_KEYS;

  complaintForm = {
    name: '',
    phone: '',
    subject: '',
    location: '',
    details: ''
  };

  complaintFieldErrors: Partial<
    Record<'name' | 'phone' | 'subject' | 'details', string | undefined>
  > = {};

  complaintEvidenceFile: File | null = null;

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

  onComplaintFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    this.complaintEvidenceFile = input.files?.[0] ?? null;
  }

  close(): void {
    this.cancelled.emit();
  }

  submit(): void {
    const { ok, errors } = validateCertificateComplaint(this.complaintForm);
    this.complaintFieldErrors = ok ? {} : errors;
    if (!ok) {
      return;
    }
    this.submitted.emit();
  }
}
