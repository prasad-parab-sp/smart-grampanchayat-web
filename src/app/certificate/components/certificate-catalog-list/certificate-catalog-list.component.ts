import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TrackByFunction
} from '@angular/core';
import { CertificateCatalogRow, CertificateListItem, isCertificateSectionHeader } from '../../data/certificate-catalog.data';
import { CertificateRowComponent } from '../certificate-row/certificate-row.component';
import { CertificateSectionHeadComponent } from '../certificate-section-head/certificate-section-head.component';

@Component({
  selector: 'app-certificate-catalog-list',
  standalone: true,
  imports: [CommonModule, CertificateSectionHeadComponent, CertificateRowComponent],
  templateUrl: './certificate-catalog-list.component.html',
  styleUrls: ['./certificate-catalog-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CertificateCatalogListComponent {
  @Input({ required: true }) displayRows!: CertificateCatalogRow[];
  @Input({ required: true }) trackByRow!: TrackByFunction<CertificateCatalogRow>;
  @Output() readonly openItem = new EventEmitter<CertificateListItem>();

  readonly isCertificateSectionHeader = isCertificateSectionHeader;
}
