import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home-intro',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './home-intro.component.html',
  styleUrls: ['./home-intro.component.scss']
})
export class HomeIntroComponent {
  constructor(private readonly translate: TranslateService) {}

  get displayDate(): string {
    const lang = this.translate.currentLang || 'mr';
    const loc = lang === 'en' ? 'en-IN' : 'mr-IN';
    return new Intl.DateTimeFormat(loc, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());
  }
}
