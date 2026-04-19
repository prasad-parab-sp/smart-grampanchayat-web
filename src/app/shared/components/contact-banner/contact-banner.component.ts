import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface ContactBannerConfig {
  contactNumber: string;
  contactLabel: string;
}

@Component({
  selector: 'app-contact-banner',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './contact-banner.component.html',
  styleUrls: ['./contact-banner.component.scss']
})
export class ContactBannerComponent {
  @Input() config: ContactBannerConfig = {
    contactNumber: '',
    contactLabel: 'हेल्पलाइन नंबर'
  };
}