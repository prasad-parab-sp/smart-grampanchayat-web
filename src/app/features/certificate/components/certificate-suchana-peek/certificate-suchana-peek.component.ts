import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-certificate-suchana-peek',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './certificate-suchana-peek.component.html',
  styleUrls: ['./certificate-suchana-peek.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CertificateSuchanaPeekComponent {
  @Output() readonly scrollToCard = new EventEmitter<void>();
}
