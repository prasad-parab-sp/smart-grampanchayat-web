import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import {
  Citizen,
  CitizenCreateRequest,
  CitizenDto,
  CitizenRegisterFilter,
  CitizenRegisterResponse,
  CitizenUpdateRequest,
  GenderType
} from './citizen.models';

@Injectable({ providedIn: 'root' })
export class CitizenService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/citizens`;

  /**
   * {@code GET /api/citizens/{id}} with {@code X-Tenant-Code} from {@link tenantCodeInterceptor}.
   * Returns null when not found (404); rethrows other errors.
   */
  getById(id: string): Observable<Citizen | null> {
    const clean = id.trim();
    if (!clean) {
      return of(null);
    }
    return this.http.get<Citizen>(`${this.base}/${encodeURIComponent(clean)}`).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return of(null);
        }
        return throwError(() => err);
      })
    );
  }

  /**
   * {@code GET /api/citizens/lookup?mobile=} with {@code X-Tenant-Code} from {@link tenantCodeInterceptor}.
   * Call only from explicit user actions (e.g. login submit) — not from route resolvers, `ngOnInit`, or constructors.
   */
  getByMobile(mobile: string): Observable<Citizen | null> {
    const clean = mobile.trim();
    const params = new HttpParams().set('mobile', clean);
    return this.http.get<Citizen>(`${this.base}/lookup`, { params }).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return of(null);
        }
        return throwError(() => err);
      })
    );
  }

  /** {@code GET /api/citizens} — all citizens (default {@code filter=all}). */
  listAll(options?: {
    search?: string;
    gender?: GenderType | null;
    filter?: CitizenRegisterFilter;
  }): Observable<CitizenDto[]> {
    let params = new HttpParams();
    if (options?.search?.trim()) {
      params = params.set('search', options.search.trim());
    }
    if (options?.gender) {
      params = params.set('gender', options.gender);
    }
    if (options?.filter) {
      params = params.set('filter', options.filter);
    }
    return this.http.get<CitizenDto[]>(this.base, { params });
  }

  listRegister(options?: {
    search?: string;
    gender?: GenderType | null;
    filter?: CitizenRegisterFilter;
  }): Observable<CitizenRegisterResponse> {
    let params = new HttpParams();
    if (options?.search?.trim()) {
      params = params.set('search', options.search.trim());
    }
    if (options?.gender) {
      params = params.set('gender', options.gender);
    }
    if (options?.filter) {
      params = params.set('filter', options.filter);
    }
    return this.http.get<CitizenRegisterResponse>(`${this.base}/register`, { params });
  }

  create(body: CitizenCreateRequest): Observable<CitizenDto> {
    return this.http.post<CitizenDto>(this.base, body);
  }

  update(id: string, body: CitizenUpdateRequest): Observable<CitizenDto> {
    return this.http.put<CitizenDto>(`${this.base}/${encodeURIComponent(id)}`, body);
  }
}
