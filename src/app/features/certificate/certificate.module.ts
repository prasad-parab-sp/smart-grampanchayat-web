import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CertificateComponent } from './pages/certificate/certificate.component';
import { CertificateMyApplicationsComponent } from './pages/certificate-my-applications/certificate-my-applications.component';

/** Default export path for the feature; parent route is `certificate`. */
const CERTIFICATE_ROUTES: Routes = [
  { path: 'my-applications', component: CertificateMyApplicationsComponent },
  { path: '', component: CertificateComponent }
];

/**
 * Lazy-loaded feature: certificates / services, modals, and future certificate API services.
 * Loaded via `loadChildren` in `app.routes`.
 */
@NgModule({
  imports: [RouterModule.forChild(CERTIFICATE_ROUTES), CertificateComponent, CertificateMyApplicationsComponent]
  // providers: [CertificateApiService] — add when HTTP layer exists
})
export class CertificateModule {}
