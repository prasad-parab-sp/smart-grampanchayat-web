import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Citizen } from './citizen.models';

@Injectable({ providedIn: 'root' })
export class CitizenService {
  private readonly http = inject(HttpClient);

  /**
   * {@code GET /api/citizens?mobile=} with {@code X-Tenant-Code} from {@link tenantCodeInterceptor}.
   * Call only from explicit user actions (e.g. login submit) — never from route init or constructors.
   * Returns null when not found (404); rethrows other errors (network / 503).
   */
  getByMobile(mobile: string): Observable<Citizen | null> {
    const clean = mobile.trim();
    const params = new HttpParams().set('mobile', clean);
    return this.http
      .get<Citizen>(`${environment.apiBaseUrl}/api/citizens`, { params })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 404) {
            return of(null);
          }
          return throwError(() => err);
        })
      );
  }
}
