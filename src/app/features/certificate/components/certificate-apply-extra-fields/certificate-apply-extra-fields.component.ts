import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  CertificateExtraErrors,
  CertificateExtraNormalized,
  normalizeCertificateExtraType
} from '../../lib/certificate-extra-fields';

/**
 * Additional inputs per certificate type (legacy templates and/or future API `certificate_type_field`).
 * Not imported by {@link CertificateApplyModalComponent} until the API supplies field metadata.
 */
@Component({
  selector: 'app-certificate-apply-extra-fields',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './certificate-apply-extra-fields.component.html',
  styleUrls: ['./certificate-apply-extra-fields.component.scss', '../../styles/certificate-modal.shared.scss']
})
export class CertificateApplyExtraFieldsComponent {
  @Input({ required: true }) catalogExtraKey!: string;
  @Input({ required: true }) model!: Record<string, string>;
  @Input() fieldErrors: CertificateExtraErrors = {};

  get normalized(): CertificateExtraNormalized {
    return normalizeCertificateExtraType(this.catalogExtraKey);
  }
}
