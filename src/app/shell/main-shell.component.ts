import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GramAppHeaderComponent } from '../shared/components/gram-app-header/gram-app-header.component';
import { MAIN_SHELL_NAV } from './main-shell.nav';

@Component({
  selector: 'app-main-shell',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    GramAppHeaderComponent,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './main-shell.component.html',
  styleUrls: ['./main-shell.component.scss']
})
export class MainShellComponent {
  readonly navItems = MAIN_SHELL_NAV;

  constructor(private readonly router: Router) {}

  logout() {
    void this.router.navigate(['/login']);
  }
}
