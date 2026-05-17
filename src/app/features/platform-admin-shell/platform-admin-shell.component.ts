import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MasterAdminSessionService } from '../../core/master-admin-session.service';
import { ICONS } from '../../shared';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-platform-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './platform-admin-shell.component.html',
  styleUrls: ['./platform-admin-shell.component.scss']
})
export class PlatformAdminShellComponent {
  private readonly session = inject(MasterAdminSessionService);
  private readonly router = inject(Router);

  readonly icons = ICONS;
  readonly user = this.session.get();

  logout(): void {
    this.session.clear();
    void this.router.navigate(['/admin/login']);
  }
}
