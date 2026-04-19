import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export type HomeNavId = 'home' | 'kar' | 'dakhale' | 'notice' | 'profile';

interface HomeStat {
  value: string;
  labelKey: string;
  valueModifier?: 'default' | 'danger';
}

interface HomeQuickLink {
  icon: string;
  titleKey: string;
  subKey: string;
}

interface HomeNavItem {
  id: HomeNavId;
  icon: string;
  labelKey: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  activeNav: HomeNavId = 'home';

  readonly bannerUrl = '/assets/images/Gram-Panchayat.png';
  readonly logoUrl = '/assets/images/logo.png';

  private readonly svgLogoFallback =
    'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 60%22><circle cx=%2230%22 cy=%2230%22 r=%2229%22 fill=%22%232E7D32%22/><text x=%2230%22 y=%2238%22 font-size=%2220%22 text-anchor=%22middle%22 fill=%22white%22>🏛️</text></svg>';

  readonly stats: HomeStat[] = [
    { value: '—', labelKey: 'HOME.STAT_TOTAL_RECORDS', valueModifier: 'default' },
    { value: '—', labelKey: 'HOME.STAT_PENDING', valueModifier: 'danger' },
    { value: '—', labelKey: 'HOME.STAT_ANNUAL_DEMAND', valueModifier: 'default' },
    { value: '—', labelKey: 'HOME.STAT_TOTAL_ARREARS', valueModifier: 'danger' }
  ];

  readonly quickLinks: HomeQuickLink[] = [
    { icon: '📋', titleKey: 'HOME.QL_DAKHALE_TITLE', subKey: 'HOME.QL_DAKHALE_SUB' },
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

  readonly navItems: HomeNavItem[] = [
    { id: 'home', icon: '🏠', labelKey: 'HOME.NAV_HOME' },
    { id: 'kar', icon: '💰', labelKey: 'HOME.NAV_KAR' },
    { id: 'dakhale', icon: '📋', labelKey: 'HOME.NAV_DAKHALE' },
    { id: 'notice', icon: '📢', labelKey: 'HOME.NAV_NOTICE' },
    { id: 'profile', icon: '👤', labelKey: 'HOME.NAV_PROFILE' }
  ];

  constructor(private readonly router: Router) {}

  setNav(id: HomeNavId) {
    this.activeNav = id;
  }

  logout() {
    void this.router.navigate(['/login']);
  }

  onLogoError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    img.src = this.svgLogoFallback;
  }

  statValueClass(mod?: 'default' | 'danger'): Record<string, boolean> {
    return {
      'stat-n': true,
      'stat-n--danger': mod === 'danger'
    };
  }
}
