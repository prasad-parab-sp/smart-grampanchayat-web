import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import {
  CertificateTypeCategory,
  CertificateTypeCreateRequest,
  CertificateTypeDto,
  CertificateTypeUpsertRequest
} from './certificate-type.models';

function normalizeCertificateTypeDto(raw: CertificateTypeDto): CertificateTypeDto {
  const iconRaw = raw.icon;
  const icon =
    typeof iconRaw === 'string' && iconRaw.trim() !== '' ? iconRaw.trim() : null;
  return { ...raw, icon };
}

@Injectable({ providedIn: 'root' })
export class CertificateTypeService {
  private readonly http = inject(HttpClient);

  /**
   * {@code GET /api/certificate-types} with optional category and {@code X-Tenant-Code} from {@link tenantCodeInterceptor}.
   * Normalizes {@code icon} only (trim; empty → null). Fees come from the server as-is.
   * {@code category} is trusted as {@link CertificateTypeCategory} from the API (same as DB enum).
   */
  list(category?: CertificateTypeCategory): Observable<CertificateTypeDto[]> {
    const url = `${environment.apiBaseUrl}/api/certificate-types`;
    const req = category
      ? this.http.get<CertificateTypeDto[]>(url, { params: { category } })
      : this.http.get<CertificateTypeDto[]>(url);
    return req.pipe(map((rows) => rows.map(normalizeCertificateTypeDto)));
  }

  /** {@code POST /api/certificate-types} — creates a tenant-scoped certificate type (staff credentials required). */
  create(body: CertificateTypeCreateRequest): Observable<CertificateTypeDto> {
    const url = `${environment.apiBaseUrl}/api/certificate-types`;
    return this.http.post<CertificateTypeDto>(url, body).pipe(map(normalizeCertificateTypeDto));
  }

  /** {@code GET /api/certificate-types/tenant-owned} — tenant catalog for GP Admin (includes inactive). */
  listTenantOwned(): Observable<CertificateTypeDto[]> {
    const url = `${environment.apiBaseUrl}/api/certificate-types/tenant-owned`;
    return this.http.get<CertificateTypeDto[]>(url).pipe(map((rows) => rows.map(normalizeCertificateTypeDto)));
  }

  /** {@code GET /api/certificate-types/{id}} — one tenant-owned row for edit. */
  getTenantOwnedById(id: string): Observable<CertificateTypeDto> {
    const url = `${environment.apiBaseUrl}/api/certificate-types/${encodeURIComponent(id)}`;
    return this.http.get<CertificateTypeDto>(url).pipe(map(normalizeCertificateTypeDto));
  }

  /** {@code PUT /api/certificate-types/{id}} — body is {@link CertificateTypeUpsertRequest} only (no re-auth). */
  update(id: string, body: CertificateTypeUpsertRequest): Observable<CertificateTypeDto> {
    const url = `${environment.apiBaseUrl}/api/certificate-types/${encodeURIComponent(id)}`;
    return this.http.put<CertificateTypeDto>(url, body).pipe(map(normalizeCertificateTypeDto));
  }
}
