import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GpTrustBannerComponent } from './gp-trust-banner/gp-trust-banner.component';
import { HomeCategorySectionComponent } from './home-category-section/home-category-section.component';
import { HomeFeaturedLinksComponent } from './home-featured-links/home-featured-links.component';
import { HomeIntroComponent } from './home-intro/home-intro.component';
import { HomeSummaryStatsComponent } from './home-summary-stats/home-summary-stats.component';
import type { HomeLinkCategory, HomeQuickLink, HomeStat } from './models/home.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    GpTrustBannerComponent,
    HomeIntroComponent,
    HomeSummaryStatsComponent,
    HomeFeaturedLinksComponent,
    HomeCategorySectionComponent
  ],
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
}
