import type { HomeLinkSlug, HomeQuickLink } from '../models/home.models';

export function homeLinkRoute(slug: HomeLinkSlug): string[] {
  return slug === 'certificate' ? ['/certificate'] : ['/stub', slug];
}

export function homeQuickLinkRoute(q: HomeQuickLink): string[] {
  return homeLinkRoute(q.slug);
}

/** All routes except certificate currently go to a placeholder screen. */
export function isHomeStubLink(q: HomeQuickLink): boolean {
  return q.slug !== 'certificate';
}
