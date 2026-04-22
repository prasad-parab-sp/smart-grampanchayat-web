import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
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
  @Input({ required: true }) row!: CertificateListItem;
  @Output() readonly open = new EventEmitter<CertificateListItem>();
}
