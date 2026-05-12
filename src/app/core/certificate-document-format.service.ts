import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  CertificateDocumentFormatDto,
  CertificateDocumentFormatUpsertRequest
} from './certificate-document-format.models';

@Injectable({ providedIn: 'root' })
export class CertificateDocumentFormatService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/certificate-document-formats`;

  list(): Observable<CertificateDocumentFormatDto[]> {
    return this.http.get<CertificateDocumentFormatDto[]>(this.base);
  }

  create(body: CertificateDocumentFormatUpsertRequest): Observable<CertificateDocumentFormatDto> {
    return this.http.post<CertificateDocumentFormatDto>(this.base, body);
  }

  update(
    id: string,
    body: CertificateDocumentFormatUpsertRequest
  ): Observable<CertificateDocumentFormatDto> {
    return this.http.put<CertificateDocumentFormatDto>(`${this.base}/${encodeURIComponent(id)}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${encodeURIComponent(id)}`);
  }
}
