import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import type {
  CertificateApplicationApproveRequest,
  CertificateApplicationDto,
  CertificateApplicationStatus,
  CertificateApplicationSubmitRequest
} from './certificate-application.models';

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

  /**
   * {@code GET /api/certificate-applications?citizenId=&status=} — newest first (server).
   */
  list(citizenId?: string, status?: CertificateApplicationStatus): Observable<CertificateApplicationDto[]> {
    const url = `${environment.apiBaseUrl}/api/certificate-applications`;
    let params = new HttpParams();
    const id = citizenId?.trim();
    if (id) {
      params = params.set('citizenId', id);
    }
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<CertificateApplicationDto[]>(url, { params });
  }

  /**
   * Gramsevak only — server checks stored role and credentials.
   */
  approve(applicationId: string, body: CertificateApplicationApproveRequest): Observable<CertificateApplicationDto> {
    const url = `${environment.apiBaseUrl}/api/certificate-applications/${encodeURIComponent(applicationId)}/approve`;
    return this.http.post<CertificateApplicationDto>(url, body);
  }
}
