import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import type { TenantCreateRequest, TenantProvisionResult } from './platform-tenant.models';

@Injectable({ providedIn: 'root' })
export class PlatformTenantService {
  private readonly http = inject(HttpClient);

  createTenant(body: TenantCreateRequest): Observable<TenantProvisionResult> {
    return this.http.post<TenantProvisionResult>(`${environment.apiBaseUrl}/api/tenants`, body);
  }
}
