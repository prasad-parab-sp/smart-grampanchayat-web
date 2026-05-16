import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { NoticeService } from '../../core/notice.service';
import type { NoticeDto, NoticeType } from '../../core/notice.models';
import { NOTICE_FILTER_CHIPS, noticeTypeLabelKey } from '../../core/notice.models';
import { I18nService } from '../../i18n/i18n.service';

const RECENT_DAYS = 7;

@Component({
  selector: 'app-notice-board',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './notice-board.component.html',
  styleUrls: ['./notice-board.component.scss']
})
export class NoticeBoardComponent implements OnInit {
  private readonly noticesApi = inject(NoticeService);
  private readonly i18n = inject(I18nService);

  readonly filterChips = NOTICE_FILTER_CHIPS;
  readonly noticeTypeLabelKey = noticeTypeLabelKey;
  activeFilter: 'all' | NoticeType = 'all';
  loading = false;
  errorKey: string | null = null;
  private allRows: NoticeDto[] = [];
  rows: NoticeDto[] = [];

  ngOnInit(): void {
    void this.load();
  }

  setFilter(key: 'all' | NoticeType): void {
    this.activeFilter = key;
    this.applyFilter();
  }

  chipCount(key: 'all' | NoticeType): number {
    if (key === 'all') {
      return this.allRows.length;
    }
    return this.allRows.filter((n) => n.noticeType === key).length;
  }

  cardModifier(type: NoticeType): string {
    switch (type) {
      case 'URGENT':
        return 'notice-card--urgent';
      case 'MEETING':
        return 'notice-card--meeting';
      case 'MEMBER':
        return 'notice-card--member';
      default:
        return 'notice-card--notice';
    }
  }

  isRecent(publishedOn: string): boolean {
    const [y, m, d] = publishedOn.split('-').map((x) => parseInt(x, 10));
    if (!y || !m || !d) {
      return false;
    }
    const published = new Date(y, m - 1, d);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RECENT_DAYS);
    cutoff.setHours(0, 0, 0, 0);
    return published >= cutoff;
  }

  async load(): Promise<void> {
    this.loading = true;
    this.errorKey = null;
    try {
      this.allRows = await firstValueFrom(this.noticesApi.list());
      this.applyFilter();
    } catch {
      this.errorKey = 'NOTICE.ERR_LOAD';
      this.allRows = [];
      this.rows = [];
    } finally {
      this.loading = false;
    }
  }

  private applyFilter(): void {
    if (this.activeFilter === 'all') {
      this.rows = [...this.allRows];
      return;
    }
    this.rows = this.allRows.filter((n) => n.noticeType === this.activeFilter);
  }

  formatDate(isoDate: string): string {
    if (!isoDate) {
      return '';
    }
    const [y, m, d] = isoDate.split('-').map((x) => parseInt(x, 10));
    if (!y || !m || !d) {
      return isoDate;
    }
    const dt = new Date(y, m - 1, d);
    const locale = this.i18n.currentLang === 'en' ? 'en-IN' : 'mr-IN';
    return dt.toLocaleDateString(locale);
  }
}
