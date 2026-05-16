import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import type {
  CitizenTaxBulkCreateRequest,
  CitizenTaxBulkCreateResult,
  CitizenTaxCreateRequest,
  CitizenTaxDto,
  CitizenTaxStatus,
  CitizenTaxWaiveRequest,
  TaxPaymentCreateRequest,
  TaxPaymentDto,
  TaxTypeCreateRequest,
  TaxTypeDto,
  TaxTypePatchRequest
} from './tax.models';

@Injectable({ providedIn: 'root' })
export class TaxService {
  private readonly http = inject(HttpClient);
  private readonly typesBase = `${environment.apiBaseUrl}/api/tax-types`;
  private readonly citizenTaxesBase = `${environment.apiBaseUrl}/api/citizen-taxes`;

  listTaxTypes(activeOnly = true): Observable<TaxTypeDto[]> {
    return this.http.get<TaxTypeDto[]>(this.typesBase, {
      params: { activeOnly: String(activeOnly) }
    });
  }

  getTaxType(id: string): Observable<TaxTypeDto> {
    return this.http.get<TaxTypeDto>(`${this.typesBase}/${encodeURIComponent(id)}`);
  }

  createTaxType(body: TaxTypeCreateRequest): Observable<TaxTypeDto> {
    return this.http.post<TaxTypeDto>(this.typesBase, body);
  }

  patchTaxType(id: string, body: TaxTypePatchRequest): Observable<TaxTypeDto> {
    return this.http.patch<TaxTypeDto>(`${this.typesBase}/${encodeURIComponent(id)}`, body);
  }

  listCitizenTaxesForCitizen(citizenId: string): Observable<CitizenTaxDto[]> {
    return this.http.get<CitizenTaxDto[]>(
      `${environment.apiBaseUrl}/api/citizens/${encodeURIComponent(citizenId)}/taxes`
    );
  }

  listCitizenTaxes(options?: {
    status?: CitizenTaxStatus;
    financialYear?: string;
  }): Observable<CitizenTaxDto[]> {
    const params: Record<string, string> = {};
    if (options?.status) {
      params['status'] = options.status;
    }
    if (options?.financialYear?.trim()) {
      params['financialYear'] = options.financialYear.trim();
    }
    return this.http.get<CitizenTaxDto[]>(this.citizenTaxesBase, {
      params: Object.keys(params).length ? params : undefined
    });
  }

  getCitizenTax(id: string): Observable<CitizenTaxDto> {
    return this.http.get<CitizenTaxDto>(`${this.citizenTaxesBase}/${encodeURIComponent(id)}`);
  }

  bulkCreateCitizenTaxes(body: CitizenTaxBulkCreateRequest): Observable<CitizenTaxBulkCreateResult> {
    return this.http.post<CitizenTaxBulkCreateResult>(`${this.citizenTaxesBase}/bulk`, body);
  }

  createCitizenTax(citizenId: string, body: CitizenTaxCreateRequest): Observable<CitizenTaxDto> {
    return this.http.post<CitizenTaxDto>(
      `${environment.apiBaseUrl}/api/citizens/${encodeURIComponent(citizenId)}/taxes`,
      body
    );
  }

  waiveCitizenTax(id: string, body: CitizenTaxWaiveRequest): Observable<CitizenTaxDto> {
    return this.http.patch<CitizenTaxDto>(`${this.citizenTaxesBase}/${encodeURIComponent(id)}/waive`, body);
  }

  listPayments(citizenTaxId: string): Observable<TaxPaymentDto[]> {
    return this.http.get<TaxPaymentDto[]>(
      `${this.citizenTaxesBase}/${encodeURIComponent(citizenTaxId)}/payments`
    );
  }

  recordPayment(citizenTaxId: string, body: TaxPaymentCreateRequest): Observable<TaxPaymentDto> {
    return this.http.post<TaxPaymentDto>(
      `${this.citizenTaxesBase}/${encodeURIComponent(citizenTaxId)}/payments`,
      body
    );
  }
}
