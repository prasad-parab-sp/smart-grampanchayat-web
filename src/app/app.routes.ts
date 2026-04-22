import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MainShellComponent } from './shell/main-shell.component';
import { ShellPlaceholderComponent } from './shell/shell-placeholder.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', component: HomeComponent },
      {
        path: 'certificate',
        loadChildren: () => import('./certificate/certificate.module').then((m) => m.CertificateModule)
      },
      { path: 'stub/:slug', component: ShellPlaceholderComponent },
      { path: 'kar', component: ShellPlaceholderComponent },
      { path: 'notice', component: ShellPlaceholderComponent },
      { path: 'profile', component: ShellPlaceholderComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
