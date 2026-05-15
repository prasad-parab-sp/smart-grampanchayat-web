import { Routes } from '@angular/router';
import { gpAdminGuard, nonGpAdminGuard } from './core/admin-role.guards';
import { adminSessionGuard } from './core/admin-session.guard';
import { tenantReadyGuard } from './core/tenant-ready.guard';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { AdminHomeComponent } from './features/admin-home/admin-home.component';
import { AdminCertificateApplicationsComponent } from './features/admin-certificate-applications/admin-certificate-applications.component';
import { AdminCertificateTypeCreateComponent } from './features/admin-certificate-type-create/admin-certificate-type-create.component';
import { AdminCertificateTypeListComponent } from './features/admin-certificate-type-list/admin-certificate-type-list.component';
import { MainShellComponent } from './layout/main-shell.component';
import { ShellPlaceholderComponent } from './layout/shell-placeholder.component';
import { TenantErrorComponent } from './layout/tenant-error.component';

export const routes: Routes = [
  { path: 'tenant-error', component: TenantErrorComponent },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, canActivate: [tenantReadyGuard] },
  { path: 'admin/home', component: AdminHomeComponent, canActivate: [tenantReadyGuard, adminSessionGuard] },
  {
    path: 'admin/certificate-applications',
    component: AdminCertificateApplicationsComponent,
    canActivate: [tenantReadyGuard, adminSessionGuard, nonGpAdminGuard]
  },
  {
    path: 'admin/certificate-types',
    component: AdminCertificateTypeListComponent,
    canActivate: [tenantReadyGuard, adminSessionGuard, gpAdminGuard]
  },
  {
    path: 'admin/certificate-types/new',
    component: AdminCertificateTypeCreateComponent,
    canActivate: [tenantReadyGuard, adminSessionGuard, gpAdminGuard]
  },
  {
    path: 'admin/certificate-types/:id/edit',
    component: AdminCertificateTypeCreateComponent,
    canActivate: [tenantReadyGuard, adminSessionGuard, gpAdminGuard]
  },
  {
    path: 'admin/formats',
    canActivate: [tenantReadyGuard, adminSessionGuard, nonGpAdminGuard],
    loadChildren: () =>
      import('./features/admin-formats/admin-formats.module').then((m) => m.AdminFormatsModule)
  },
  {
    path: '',
    component: MainShellComponent,
    canActivate: [tenantReadyGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', component: HomeComponent },
      {
        path: 'certificate',
        loadChildren: () =>
          import('./features/certificate/certificate.module').then((m) => m.CertificateModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.module').then((m) => m.ProfileModule)
      },
      { path: 'stub/:slug', component: ShellPlaceholderComponent },
      { path: 'kar', component: ShellPlaceholderComponent },
      { path: 'notice', component: ShellPlaceholderComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
