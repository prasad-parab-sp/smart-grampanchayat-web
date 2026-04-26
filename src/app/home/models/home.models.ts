export interface HomeStat {
  value: string;
  labelKey: string;
  valueModifier?: 'default' | 'danger';
}

export type HomeLinkSlug =
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

export interface HomeQuickLink {
  icon: string;
  titleKey: string;
  subKey: string;
  slug: HomeLinkSlug;
}

export interface HomeLinkCategory {
  labelKey: string;
  links: HomeQuickLink[];
}
