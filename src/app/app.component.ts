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
      max-width: 480px;
      margin: 0 auto;
      min-height: 100vh;
      background: #fff;
      position: relative;
    }

    .app-top-actions {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 50;
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