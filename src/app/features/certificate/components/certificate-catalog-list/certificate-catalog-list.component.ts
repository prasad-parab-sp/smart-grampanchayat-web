import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TrackByFunction
} from '@angular/core';
import {
  CertificateTypeCategory,
  CertificateTypeDto
} from '../../../../core/certificate-type.models';
import { CERTIFICATE_CATALOG_SECTION_META } from '../../lib/certificate-api-mapper';
import { CertificateRowComponent } from '../certificate-row/certificate-row.component';
import { CertificateSectionHeadComponent } from '../certificate-section-head/certificate-section-head.component';

/** One catalog block: section head + types (order matches filtered flat list). */
interface CertificateCatalogSection {
  category: CertificateTypeCategory;
  types: CertificateTypeDto[];
}

@Component({
  selector: 'app-certificate-catalog-list',
  standalone: true,
  imports: [CommonModule, CertificateSectionHeadComponent, CertificateRowComponent],
  templateUrl: './certificate-catalog-list.component.html',
  styleUrls: ['./certificate-catalog-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CertificateCatalogListComponent {
  @Input({ required: true }) displayRows!: CertificateTypeDto[];
  @Input({ required: true }) trackByRow!: TrackByFunction<CertificateTypeDto>;
  @Output() readonly openItem = new EventEmitter<CertificateTypeDto>();

  /** Run-length encode flat rows into category sections (preserves sort/filter order). */
  get sections(): CertificateCatalogSection[] {
    const rows = this.displayRows;
    if (!rows?.length) {
      return [];
    }
    const out: CertificateCatalogSection[] = [];
    let category = rows[0].category;
    let types: CertificateTypeDto[] = [];
    for (const row of rows) {
      if (row.category !== category) {
        out.push({ category, types });
        types = [];
        category = row.category;
      }
      types.push(row);
    }
    out.push({ category, types });
    return out;
  }

  trackBySection(index: number, _sec: CertificateCatalogSection): number {
    return index;
  }

  sectionIcon(category: CertificateTypeCategory): string {
    return CERTIFICATE_CATALOG_SECTION_META[category].icon;
  }

  sectionTitleKey(category: CertificateTypeCategory): string {
    return CERTIFICATE_CATALOG_SECTION_META[category].titleKey;
  }
}
