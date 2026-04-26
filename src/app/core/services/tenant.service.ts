import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TenantDto } from '../models/tenant.dto';

/**
 * All tenant-related HTTP access lives here (single responsibility, easy to mock in tests).
 */
@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly http = inject(HttpClient);

  /**
   * GET `/api/tenants?tenantName=...` — matches Spring `TenantController`.
   */
  getTenantByName(tenantName: string): Observable<TenantDto> {
    const url = `${environment.apiBaseUrl}/api/tenants`;
    const params = new HttpParams().set('tenantName', tenantName);
    return this.http.get<TenantDto>(url, { params });
  }

  /** Uses `environment.defaultTenantName` when you do not pass a value. */
  getDefaultTenant(): Observable<TenantDto> {
    return this.getTenantByName(environment.defaultTenantName);
  }
}
