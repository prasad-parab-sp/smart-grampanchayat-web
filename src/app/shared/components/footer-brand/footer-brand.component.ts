import { Component, Input } from '@angular/core';

export interface FooterBrandConfig {
  brandName?: string;
  developerName?: string;
  year?: number;
}

@Component({
  selector: 'app-footer-brand',
  standalone: true,
  imports: [],
  templateUrl: './footer-brand.component.html',
  styleUrls: ['./footer-brand.component.scss']
})
export class FooterBrandComponent {
  @Input() config: FooterBrandConfig = {
    brandName: 'Smart Grampanchayat',
    developerName: 'Amey Infotech',
    year: new Date().getFullYear()
  };
}