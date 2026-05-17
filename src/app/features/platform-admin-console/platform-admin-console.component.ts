import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { MasterAdminSessionService } from '../../core/master-admin-session.service';
import { PlatformStatsService } from '../../core/platform-stats.service';
import type { PlatformStats } from '../../core/platform-admin.models';
import { ICONS } from '../../shared';

@Component({
  selector: 'app-platform-admin-console',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './platform-admin-console.component.html',
  styleUrls: ['./platform-admin-console.component.scss']
})
export class PlatformAdminConsoleComponent implements OnInit {
  readonly icons = ICONS;
  readonly user = inject(MasterAdminSessionService).get();
  private readonly statsService = inject(PlatformStatsService);

  stats: PlatformStats | null = null;
  statsError = false;

  ngOnInit(): void {
    void this.loadStats();
  }

  private async loadStats(): Promise<void> {
    try {
      this.stats = await firstValueFrom(this.statsService.getStats());
      this.statsError = false;
    } catch {
      this.stats = null;
      this.statsError = true;
    }
  }
}
