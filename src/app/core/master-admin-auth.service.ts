import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import type { PlatformAdminLoginRequest, PlatformAdminLoginResponse } from './platform-admin.models';
import type { MasterAdminSessionUser } from './master-admin-session.service';

@Injectable({ providedIn: 'root' })
export class MasterAdminAuthService {
  private readonly http = inject(HttpClient);

  login(mobile: string, password: string): Observable<MasterAdminSessionUser> {
    const body: PlatformAdminLoginRequest = {
      mobile: mobile.replace(/\D/g, '').slice(-10),
      password
    };
    return this.http
      .post<PlatformAdminLoginResponse>(`${environment.apiBaseUrl}/api/platform/auth/login`, body)
      .pipe(
        map((res) => ({
          id: res.id,
          mobile: res.mobile,
          displayName: res.displayName?.trim() || res.mobile,
          role: res.role === 'super_admin' ? 'super_admin' : 'platform_admin'
        }))
      );
  }
}
