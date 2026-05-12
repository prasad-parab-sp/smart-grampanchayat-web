import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';

export interface AdminUser {
  id: string;
  tenantId: string;
  email: string | null;
  phone: string | null;
  /** Stored role from DB (`users.role`). */
  role: string;
  /** Role for UI and permissions while elevation window is active. */
  effectiveRole: string;
  elevatedRole: string | null;
  actingFrom: string | null;
  actingUntil: string | null;
  firstName: string;
  lastName: string;
  active: boolean;
  lastLoginAt: string | null;
}

export interface AdminLoginResponse {
  user: AdminUser;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);

  login(identifier: string, password: string): Observable<AdminLoginResponse> {
    const body = {
      identifier: identifier.trim(),
      password: password.trim()
    };
    return this.http
      .post<AdminLoginResponse>(`${environment.apiBaseUrl}/api/users/login`, body)
      .pipe(
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
  }
}
