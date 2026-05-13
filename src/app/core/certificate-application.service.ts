import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import type {
  CertificateApplicationAddStaffRemarksRequest,
  CertificateApplicationApproveRequest,
  CertificateApplicationRejectRequest,
  CertificateApplicationDto,
  CertificateApplicationStatus,
  CertificateApplicationSubmitRequest,
  CertificateIssuedDocumentDto
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

  /** {@code GET /api/certificate-applications/{id}} — tenant scoped. */
  getById(applicationId: string): Observable<CertificateApplicationDto> {
    const url = `${environment.apiBaseUrl}/api/certificate-applications/${encodeURIComponent(applicationId)}`;
    return this.http.get<CertificateApplicationDto>(url);
  }

  /**
   * Gramsevak only — server checks stored role and credentials.
   */
  approve(applicationId: string, body: CertificateApplicationApproveRequest): Observable<CertificateApplicationDto> {
    const url = `${environment.apiBaseUrl}/api/certificate-applications/${encodeURIComponent(applicationId)}/approve`;
    return this.http.post<CertificateApplicationDto>(url, body);
  }

  /** Gramsevak only — rejects application; optional remarks appended first. */
  reject(applicationId: string, body: CertificateApplicationRejectRequest): Observable<CertificateApplicationDto> {
    const url = `${environment.apiBaseUrl}/api/certificate-applications/${encodeURIComponent(applicationId)}/reject`;
    return this.http.post<CertificateApplicationDto>(url, body);
  }

  /**
   * Gramsevak only — appends remark lines (same credential model as approve).
   */
  appendStaffRemarks(
    applicationId: string,
    body: CertificateApplicationAddStaffRemarksRequest
  ): Observable<CertificateApplicationDto> {
    const url = `${environment.apiBaseUrl}/api/certificate-applications/${encodeURIComponent(applicationId)}/staff-remarks`;
    return this.http.post<CertificateApplicationDto>(url, body);
  }

  /**
   * Approved applications only — server checks citizenId matches the row.
   */
  getIssuedDocument(
    applicationId: string,
    citizenId: string,
    lang?: string
  ): Observable<CertificateIssuedDocumentDto> {
    const url = `${environment.apiBaseUrl}/api/certificate-applications/${encodeURIComponent(applicationId)}/issued-document`;
    let params = new HttpParams().set('citizenId', citizenId.trim());
    const l = lang?.trim();
    if (l) {
      params = params.set('lang', l);
    }
    return this.http.get<CertificateIssuedDocumentDto>(url, { params });
  }
}
