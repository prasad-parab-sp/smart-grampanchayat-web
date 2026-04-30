import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import type { HomeStat } from '../models/home.models';

@Component({
  selector: 'app-home-summary-stats',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './home-summary-stats.component.html',
  styleUrls: ['./home-summary-stats.component.scss']
})
export class HomeSummaryStatsComponent {
  @Input({ required: true }) stats: HomeStat[] = [];

  isStatPlaceholder(s: HomeStat): boolean {
    const v = (s.value ?? '').trim();
    return v === '' || v === '—' || v === '-';
  }

  statValueClasses(s: HomeStat): Record<string, boolean> {
    const ph = this.isStatPlaceholder(s);
    return {
      'stat-n': true,
      'stat-n--placeholder': ph,
      'stat-n-danger': !ph && s.valueModifier === 'danger'
    };
  }
}
