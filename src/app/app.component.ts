import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './i18n/i18n.service';
import { LanguageSwitcherComponent } from './shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LanguageSwitcherComponent],
  template: `
    <div class="app-container">
      <div class="app-top-actions">
        <app-language-switcher></app-language-switcher>
      </div>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      width: 100%;
      min-height: 100vh;
      background: #fff;
      position: relative;
    }

    .app-top-actions {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 50;
    }

    @media (min-width: 768px) {
      .app-top-actions {
        top: 16px;
        right: 16px;
      }
    }
  `]
})
export class AppComponent {
  title = 'SmartGramPanchayat';

  constructor(
    private readonly i18n: I18nService
  ) {
    this.i18n.init();
  }
}