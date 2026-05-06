import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import type { CertificateApplicationDto, CertificateApplicationSubmitRequest } from './certificate-application.models';

@Injectable({ providedIn: 'root' })
export class CertificateApplicationService {
  private readonly http = inject(HttpClient);

  /**
   * {@code POST /api/certificate-applications} with {@code X-Tenant-Code} from {@link tenantCodeInterceptor}.
   */
  submit(body: CertificateApplicationSubmitRequest): Observable<CertificateApplicationDto> {
    const url = `${environment.apiBaseUrl}/api/certificate-applications`;
    return this.http.post<CertificateApplicationDto>(url, body);
  }
}
