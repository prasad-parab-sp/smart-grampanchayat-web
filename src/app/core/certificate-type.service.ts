import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import {
  CertificateTypeCategory,
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

  /** {@code POST /api/certificate-types} — creates a tenant-scoped certificate type. */
  create(body: CertificateTypeUpsertRequest): Observable<CertificateTypeDto> {
    const url = `${environment.apiBaseUrl}/api/certificate-types`;
    return this.http.post<CertificateTypeDto>(url, body).pipe(map(normalizeCertificateTypeDto));
  }
}
