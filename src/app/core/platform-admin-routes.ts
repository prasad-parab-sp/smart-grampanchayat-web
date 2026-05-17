/** Platform console URLs — no district tenant bootstrap or {@code X-Tenant-Code}. */
export function isPlatformAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin/login') || pathname.startsWith('/admin/platform');
}
