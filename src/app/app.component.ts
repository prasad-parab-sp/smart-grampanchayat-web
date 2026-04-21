import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './i18n/i18n.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
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
