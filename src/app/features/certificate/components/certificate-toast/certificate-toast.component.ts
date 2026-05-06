import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/** Inline success/ack message after stub submit. */
@Component({
  selector: 'app-certificate-toast',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './certificate-toast.component.html',
  styleUrls: ['./certificate-toast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CertificateToastComponent {
  @Input({ required: true }) messageKey!: string;
  /** Optional ngx-translate interpolation params (e.g. reference number). */
  @Input() translateParams: Record<string, unknown> | null = null;
  @Output() readonly dismissed = new EventEmitter<void>();
}
