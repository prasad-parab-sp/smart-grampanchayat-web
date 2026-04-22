import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-certificate-section-head',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './certificate-section-head.component.html',
  styleUrls: ['./certificate-section-head.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CertificateSectionHeadComponent {
  @Input({ required: true }) sectionId!: string;
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) titleKey!: string;
}
