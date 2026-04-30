import { APP_INITIALIZER } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { TenantService } from './app/core/tenant.service';
import { tenantCodeInterceptor } from './app/core/tenant-code.interceptor';

function tenantInitializerFactory(tenant: TenantService) {
  return () => tenant.loadOnStartup();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([tenantCodeInterceptor])),
    provideTranslateService({
      fallbackLang: 'mr',
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      })
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: tenantInitializerFactory,
      deps: [TenantService],
      multi: true
    }
  ]
}).catch((err) => console.error(err));
