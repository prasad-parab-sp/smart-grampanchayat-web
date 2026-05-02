import { Routes } from '@angular/router';
import { tenantReadyGuard } from './core/tenant-ready.guard';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { MainShellComponent } from './layout/main-shell.component';
import { ShellPlaceholderComponent } from './layout/shell-placeholder.component';
import { TenantErrorComponent } from './layout/tenant-error.component';

export const routes: Routes = [
  { path: 'tenant-error', component: TenantErrorComponent },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, canActivate: [tenantReadyGuard] },
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
      { path: 'stub/:slug', component: ShellPlaceholderComponent },
      { path: 'kar', component: ShellPlaceholderComponent },
      { path: 'notice', component: ShellPlaceholderComponent },
      { path: 'profile', component: ShellPlaceholderComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
