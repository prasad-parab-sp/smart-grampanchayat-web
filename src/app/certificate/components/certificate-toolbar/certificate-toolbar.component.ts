import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CertificateFilterPreset } from '../../data/certificate-filters.data';

@Component({
  selector: 'app-certificate-toolbar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './certificate-toolbar.component.html',
  styleUrls: ['./certificate-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CertificateToolbarComponent {
  @Input({ required: true }) searchQuery!: string;
  @Output() readonly searchQueryChange = new EventEmitter<string>();

  @Input({ required: true }) filterPresets!: CertificateFilterPreset[];
  @Input({ required: true }) activeFilter!: string;
  @Output() readonly filterChange = new EventEmitter<string>();

  onSearchInput(ev: Event): void {
    this.searchQueryChange.emit((ev.target as HTMLInputElement).value);
  }
}
