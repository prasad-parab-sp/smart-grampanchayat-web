import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../../../../i18n/i18n.service';
import {
  certificateCatalogDisplayDescription,
  certificateCatalogDisplayName,
  certificateShowsCatalogDefaultVersusTenantFee
} from '../../lib/certificate-api-mapper';
import { CertificateListItem } from '../../data/certificate-catalog.data';

@Component({
  selector: 'app-certificate-row',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './certificate-row.component.html',
  styleUrls: ['./certificate-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CertificateRowComponent {
  readonly i18n = inject(I18nService);

  @Input({ required: true }) row!: CertificateListItem;
  @Output() readonly open = new EventEmitter<CertificateListItem>();

  displayTitle(): string {
    return certificateCatalogDisplayName(this.row, this.i18n.currentLang);
  }

  displayDescription(): string {
    return certificateCatalogDisplayDescription(this.row, this.i18n.currentLang);
  }

  /** Nested {@code tenantCertificateTypeConfig} present and GP fee differs from catalog default. */
  showsCatalogDefaultVersusTenantFee(): boolean {
    return certificateShowsCatalogDefaultVersusTenantFee(this.row);
  }
}
