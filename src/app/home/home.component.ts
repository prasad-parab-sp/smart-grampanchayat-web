import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface HomeStat {
  value: string;
  labelKey: string;
  valueModifier?: 'default' | 'danger';
}

type HomeLinkSlug =
  | 'certificate'
  | 'kar'
  | 'bhade'
  | 'nidhi'
  | 'bank'
  | 'notice'
  | 'sabha'
  | 'yojana'
  | 'gramjan'
  | 'labha'
  | 'suchana'
  | 'complaint';

interface HomeQuickLink {
  icon: string;
  titleKey: string;
  subKey: string;
  slug: HomeLinkSlug;
}

interface HomeLinkCategory {
  labelKey: string;
  links: HomeQuickLink[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
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

  /** Primary tasks — most-used citizen flows */
  readonly featured: HomeQuickLink[] = [
    { icon: '📋', titleKey: 'HOME.QL_CERTIFICATE_TITLE', subKey: 'HOME.QL_CERTIFICATE_SUB', slug: 'certificate' },
    { icon: '💰', titleKey: 'HOME.QL_KAR_TITLE', subKey: 'HOME.QL_KAR_SUB', slug: 'kar' },
    { icon: '📣', titleKey: 'HOME.QL_COMPLAINT_TITLE', subKey: 'HOME.QL_COMPLAINT_SUB', slug: 'complaint' }
  ];

  readonly linkCategories: HomeLinkCategory[] = [
    {
      labelKey: 'HOME.CAT_TAX',
      links: [
        { icon: '🚜', titleKey: 'HOME.QL_BHADE_TITLE', subKey: 'HOME.QL_BHADE_SUB', slug: 'bhade' },
        { icon: '🏗️', titleKey: 'HOME.QL_NIDHI_TITLE', subKey: 'HOME.QL_NIDHI_SUB', slug: 'nidhi' },
        { icon: '🏦', titleKey: 'HOME.QL_BANK_TITLE', subKey: 'HOME.QL_BANK_SUB', slug: 'bank' }
      ]
    },
    {
      labelKey: 'HOME.CAT_INFO',
      links: [
        { icon: '📢', titleKey: 'HOME.QL_NOTICE_TITLE', subKey: 'HOME.QL_NOTICE_SUB', slug: 'notice' },
        { icon: '🔔', titleKey: 'HOME.QL_SABHA_TITLE', subKey: 'HOME.QL_SABHA_SUB', slug: 'sabha' },
        { icon: '🎓', titleKey: 'HOME.QL_YOJANA_TITLE', subKey: 'HOME.QL_YOJANA_SUB', slug: 'yojana' },
        { icon: '👥', titleKey: 'HOME.QL_GRAMJAN_TITLE', subKey: 'HOME.QL_GRAMJAN_SUB', slug: 'gramjan' },
        { icon: '🎁', titleKey: 'HOME.QL_LABHA_TITLE', subKey: 'HOME.QL_LABHA_SUB', slug: 'labha' }
      ]
    },
    {
      labelKey: 'HOME.CAT_PARTICIPATE',
      links: [{ icon: '💡', titleKey: 'HOME.QL_SUCHANA_TITLE', subKey: 'HOME.QL_SUCHANA_SUB', slug: 'suchana' }]
    }
  ];

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

  linkRoute(q: HomeQuickLink): string[] {
    return q.slug === 'certificate' ? ['/certificate'] : ['/stub', q.slug];
  }

  statValueClass(mod?: 'default' | 'danger'): Record<string, boolean> {
    return {
      'stat-n': true,
      'stat-n-danger': mod === 'danger'
    };
  }
}
