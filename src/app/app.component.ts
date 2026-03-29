import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 480px;
      margin: 0 auto;
      min-height: 100vh;
      background: #fff;
    }
  `]
})
export class AppComponent {
  title = 'SmartGramPanchayat';
}