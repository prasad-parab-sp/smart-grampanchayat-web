import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-gram-app-header',
  standalone: true,
  imports: [CommonModule, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './gram-app-header.component.html',
  styleUrls: ['./gram-app-header.component.scss']
})
export class GramAppHeaderComponent {
  @Input() bannerUrl = '/assets/images/Gram-Panchayat.png';
  @Input() logoUrl = '/assets/images/logo.png';

  @Output() logout = new EventEmitter<void>();

  private readonly svgLogoFallback =
    'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 60%22><circle cx=%2230%22 cy=%2230%22 r=%2229%22 fill=%22%232E7D32%22/><text x=%2230%22 y=%2238%22 font-size=%2220%22 text-anchor=%22middle%22 fill=%22white%22>🏛️</text></svg>';

  onLogoError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    img.src = this.svgLogoFallback;
  }

  onLogout() {
    this.logout.emit();
  }
}
