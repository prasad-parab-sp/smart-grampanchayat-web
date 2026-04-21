import { Routes } from '@angular/router';
import { DakhaleComponent } from './dakhale/dakhale.component';
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
      { path: 'dakhale', component: DakhaleComponent },
      { path: 'kar', component: ShellPlaceholderComponent },
      { path: 'notice', component: ShellPlaceholderComponent },
      { path: 'profile', component: ShellPlaceholderComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
