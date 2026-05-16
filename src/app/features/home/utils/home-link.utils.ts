import type { HomeLinkSlug, HomeQuickLink } from '../models/home.models';

const LIVE_HOME_SLUGS = new Set<HomeLinkSlug>(['certificate', 'notice']);

export function homeLinkRoute(slug: HomeLinkSlug): string[] {
  if (slug === 'certificate') {
    return ['/certificate'];
  }
  if (slug === 'notice') {
    return ['/notice'];
  }
  return ['/stub', slug];
}

export function homeQuickLinkRoute(q: HomeQuickLink): string[] {
  return homeLinkRoute(q.slug);
}

/** Placeholder screen for modules not yet wired to a real route. */
export function isHomeStubLink(q: HomeQuickLink): boolean {
  return !LIVE_HOME_SLUGS.has(q.slug);
}
