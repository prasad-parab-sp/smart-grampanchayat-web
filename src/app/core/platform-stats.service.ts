import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import type { PlatformStats } from './platform-admin.models';

@Injectable({ providedIn: 'root' })
export class PlatformStatsService {
  private readonly http = inject(HttpClient);

  getStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${environment.apiBaseUrl}/api/platform/stats`);
  }
}
