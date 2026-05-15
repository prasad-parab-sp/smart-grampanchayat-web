import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import {
  STAFF_CERTIFICATE_DIALOG_UI,
  type StaffCertificateDialogIntent
} from './staff-certificate-action-dialog.models';

/** Emitted when the user closes the dialog or submits a valid credential form. */
export type StaffCertificateDialogResult = 'dismiss' | 'submit';

/**
 * Backdrop modal: staff re-auth (identifier + password) plus optional remarks.
 * Configure with {@link intent} — labels and layout are derived internally.
 */
@Component({
  selector: 'app-staff-certificate-action-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './staff-certificate-action-dialog.component.html',
  styleUrls: ['./staff-certificate-action-dialog.component.scss']
})
export class StaffCertificateActionDialogComponent {
  @Input({ required: true }) intent!: StaffCertificateDialogIntent;

  @Input() metaLine: string | null = null;
  @Input() credentialForm!: FormGroup;
  @Input() remarksDraft = '';
  @Output() remarksDraftChange = new EventEmitter<string>();

  @Input() remarksPlaceholderKey = 'ADMIN_CERT_APP_DETAIL.APPEND_REMARKS_PH';

  @Input() submitting = false;

  /** Use one handler in the parent: dismiss → close dialog, submit → run confirm*. */
  @Output() dialogResult = new EventEmitter<StaffCertificateDialogResult>();

  get ui() {
    return STAFF_CERTIFICATE_DIALOG_UI[this.intent];
  }

  onBackdrop(): void {
    this.dialogResult.emit('dismiss');
  }

  onCancel(): void {
    this.dialogResult.emit('dismiss');
  }

  onFormSubmit(): void {
    if (this.credentialForm.invalid) {
      this.credentialForm.markAllAsTouched();
      return;
    }
    this.dialogResult.emit('submit');
  }
}
