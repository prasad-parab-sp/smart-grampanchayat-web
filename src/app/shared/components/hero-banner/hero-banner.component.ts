import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface HeroBannerConfig {
  gpName: string;
  gpLocation: string;
  logoUrl?: string;
  bannerUrl?: string;
}

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-banner.component.html',
  styleUrls: ['./hero-banner.component.scss']
})
export class HeroBannerComponent {
  @Input() config: HeroBannerConfig = {
    gpName: 'ग्रामपंचायत',
    gpLocation: ''
  };

  get defaultLogoUrl(): string {
    return 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 80 80%22><circle cx=%2240%22 cy=%2240%22 r=%2238%22 fill=%22%232E7D32%22/><text x=%2240%22 y=%2248%22 font-size=%2228%22 text-anchor=%22middle%22 fill=%22white%22>🏛️</text></svg>';
  }
}