import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-gp-trust-banner',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './gp-trust-banner.component.html',
  styleUrls: ['./gp-trust-banner.component.scss']
})
export class GpTrustBannerComponent {}
