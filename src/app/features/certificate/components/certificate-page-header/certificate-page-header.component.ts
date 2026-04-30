import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-certificate-page-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './certificate-page-header.component.html',
  styleUrls: ['./certificate-page-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CertificatePageHeaderComponent {}
