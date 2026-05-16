import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import type {
  NoticeCreateRequest,
  NoticeDeleteRequest,
  NoticeDto,
  NoticeType
} from './notice.models';

@Injectable({ providedIn: 'root' })
export class NoticeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/notices`;

  list(options?: { noticeType?: NoticeType; includeExpired?: boolean }): Observable<NoticeDto[]> {
    const params: Record<string, string> = {};
    if (options?.noticeType) {
      params['noticeType'] = options.noticeType;
    }
    if (options?.includeExpired) {
      params['includeExpired'] = 'true';
    }
    return this.http.get<NoticeDto[]>(this.base, { params: Object.keys(params).length ? params : undefined });
  }

  getById(id: string): Observable<NoticeDto> {
    return this.http.get<NoticeDto>(`${this.base}/${encodeURIComponent(id)}`);
  }

  create(body: NoticeCreateRequest): Observable<NoticeDto> {
    return this.http.post<NoticeDto>(this.base, body);
  }

  delete(id: string, body: NoticeDeleteRequest): Observable<void> {
    return this.http.delete<void>(`${this.base}/${encodeURIComponent(id)}`, { body });
  }
}
