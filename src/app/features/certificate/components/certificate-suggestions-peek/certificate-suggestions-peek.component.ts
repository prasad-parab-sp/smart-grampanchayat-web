import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-certificate-suggestions-peek',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './certificate-suggestions-peek.component.html',
  styleUrls: ['./certificate-suggestions-peek.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CertificateSuggestionsPeekComponent {
  /** When true, shows the CTA link and emits `scrollToCard` on click. Default: informational peek only. */
  @Input() showCta = false;

  @Output() readonly scrollToCard = new EventEmitter<void>();
}
