import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface HomeStat {
  value: string;
  labelKey: string;
  valueModifier?: 'default' | 'danger';
}

interface HomeQuickLink {
  icon: string;
  titleKey: string;
  subKey: string;
  route?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  readonly stats: HomeStat[] = [
    { value: '—', labelKey: 'HOME.STAT_TOTAL_RECORDS', valueModifier: 'default' },
    { value: '—', labelKey: 'HOME.STAT_PENDING', valueModifier: 'danger' },
    { value: '—', labelKey: 'HOME.STAT_ANNUAL_DEMAND', valueModifier: 'default' },
    { value: '—', labelKey: 'HOME.STAT_TOTAL_ARREARS', valueModifier: 'danger' }
  ];

  readonly quickLinks: HomeQuickLink[] = [
    { icon: '📋', titleKey: 'HOME.QL_DAKHALE_TITLE', subKey: 'HOME.QL_DAKHALE_SUB', route: '/dakhale' },
    { icon: '💰', titleKey: 'HOME.QL_KAR_TITLE', subKey: 'HOME.QL_KAR_SUB' },
    { icon: '🚜', titleKey: 'HOME.QL_BHADE_TITLE', subKey: 'HOME.QL_BHADE_SUB' },
    { icon: '🏗️', titleKey: 'HOME.QL_NIDHI_TITLE', subKey: 'HOME.QL_NIDHI_SUB' },
    { icon: '🏦', titleKey: 'HOME.QL_BANK_TITLE', subKey: 'HOME.QL_BANK_SUB' },
    { icon: '📢', titleKey: 'HOME.QL_NOTICE_TITLE', subKey: 'HOME.QL_NOTICE_SUB' },
    { icon: '🔔', titleKey: 'HOME.QL_SABHA_TITLE', subKey: 'HOME.QL_SABHA_SUB' },
    { icon: '🎓', titleKey: 'HOME.QL_YOJANA_TITLE', subKey: 'HOME.QL_YOJANA_SUB' },
    { icon: '👥', titleKey: 'HOME.QL_GRAMJAN_TITLE', subKey: 'HOME.QL_GRAMJAN_SUB' },
    { icon: '🎁', titleKey: 'HOME.QL_LABHA_TITLE', subKey: 'HOME.QL_LABHA_SUB' },
    { icon: '💡', titleKey: 'HOME.QL_SUCHANA_TITLE', subKey: 'HOME.QL_SUCHANA_SUB' },
    { icon: '📣', titleKey: 'HOME.QL_COMPLAINT_TITLE', subKey: 'HOME.QL_COMPLAINT_SUB' }
  ];

  constructor(private readonly router: Router) {}

  onQuickLink(q: HomeQuickLink) {
    if (q.route) {
      void this.router.navigateByUrl(q.route);
    }
  }

  statValueClass(mod?: 'default' | 'danger'): Record<string, boolean> {
    return {
      'stat-n': true,
      'stat-n-danger': mod === 'danger'
    };
  }
}
