import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CERTIFICATE_SUCHANA_CATEGORY_KEYS } from '../../data/certificate-form-options.data';
import { validateCertificateSuchana } from '../../lib/certificate-form-validation';

@Component({
  selector: 'app-certificate-suchana-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './certificate-suchana-modal.component.html',
  styleUrls: ['../../styles/certificate-modal.shared.scss']
})
export class CertificateSuchanaModalComponent {
  @Output() cancelled = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  readonly suchanaCategoryKeys = CERTIFICATE_SUCHANA_CATEGORY_KEYS;

  suchanaForm = {
    name: '',
    phone: '',
    category: '',
    details: '',
    benefit: ''
  };

  suchanaFieldErrors: Partial<
    Record<'name' | 'phone' | 'category' | 'details', string | undefined>
  > = {};

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

  close(): void {
    this.cancelled.emit();
  }

  submit(): void {
    const { ok, errors } = validateCertificateSuchana(this.suchanaForm);
    this.suchanaFieldErrors = ok ? {} : errors;
    if (!ok) {
      return;
    }
    this.submitted.emit();
  }
}
