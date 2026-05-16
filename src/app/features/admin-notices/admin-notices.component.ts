import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { AdminSessionService } from '../../core/admin-session.service';
import { NoticeService } from '../../core/notice.service';
import type { NoticeDto, NoticeType } from '../../core/notice.models';
import {
  addDaysIso,
  isoDateOnly,
  isNoticeExpired,
  NOTICE_TYPES,
  noticeTypeLabelKey
} from '../../core/notice.models';
import { TenantSessionStore } from '../../core/tenant-session.store';
import { ToastService } from '../../core/toast.service';
import { I18nService } from '../../i18n/i18n.service';
import { GramAppHeaderComponent } from '../../shared/components/gram-app-header/gram-app-header.component';

@Component({
  selector: 'app-admin-notices',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, GramAppHeaderComponent],
  templateUrl: './admin-notices.component.html',
  styleUrls: ['./admin-notices.component.scss']
})
export class AdminNoticesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly noticesApi = inject(NoticeService);
  private readonly adminSession = inject(AdminSessionService);
  private readonly tenantStore = inject(TenantSessionStore);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly typeOptions = NOTICE_TYPES;
  readonly noticeTypeLabelKey = noticeTypeLabelKey;
  readonly isNoticeExpired = isNoticeExpired;
  adminDisplayName: string | null = null;
  loading = false;
  rows: NoticeDto[] = [];

  publishOpen = false;
  publishSubmitting = false;
  readonly publishForm = this.fb.nonNullable.group({
    noticeType: ['NOTICE' as NoticeType, Validators.required],
    title: ['', Validators.required],
    body: ['', Validators.required],
    publishedOn: [this.todayIso(), Validators.required],
    expiresOn: [this.defaultExpiresOn(), Validators.required],
    sendToCitizens: [true],
    sendToSadasya: [false]
  });

  deleteOpen = false;
  deleteSubmitting = false;
  deleteTarget: NoticeDto | null = null;

  ngOnInit(): void {
    const admin = this.adminSession.get();
    if (!admin) {
      void this.router.navigate(['/login']);
      return;
    }
    this.adminDisplayName = `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim() || null;
    void this.load();
  }

  logout(): void {
    this.adminSession.clear();
    void this.router.navigate(['/login']);
  }

  async load(): Promise<void> {
    this.loading = true;
    try {
      this.rows = await firstValueFrom(this.noticesApi.list({ includeExpired: true }));
    } catch {
      this.rows = [];
      this.toast.show(this.i18n.translate('NOTICE.ERR_LOAD'), 'error');
    } finally {
      this.loading = false;
    }
  }

  openPublish(): void {
    const publishedOn = this.todayIso();
    this.publishForm.patchValue({ publishedOn, expiresOn: this.defaultExpiresOn(publishedOn) });
    this.publishOpen = true;
  }

  closePublish(): void {
    this.publishOpen = false;
  }

  async submitPublish(): Promise<void> {
    if (this.publishForm.invalid) {
      this.publishForm.markAllAsTouched();
      return;
    }
    const v = this.publishForm.getRawValue();
    if (v.expiresOn < v.publishedOn) {
      this.toast.show(this.i18n.translate('NOTICE.EXPIRY_BEFORE_PUBLISH'), 'error');
      return;
    }
    const admin = this.adminSession.get();
    if (!admin?.id) {
      this.toast.show(this.i18n.translate('NOTICE.PUBLISHED_ERR'), 'error');
      return;
    }
    this.publishSubmitting = true;
    try {
      await firstValueFrom(
        this.noticesApi.create({
          staffUserId: admin.id,
          notice: {
            noticeType: v.noticeType,
            title: v.title.trim(),
            body: v.body.trim(),
            publishedOn: v.publishedOn,
            expiresOn: v.expiresOn,
            sendToCitizens: v.sendToCitizens,
            sendToMembers: v.sendToSadasya
          }
        })
      );
      this.toast.show(this.i18n.translate('NOTICE.PUBLISHED_OK'), 'success');
      this.publishOpen = false;
      this.publishForm.patchValue({ title: '', body: '' });
      await this.load();
    } catch {
      this.toast.show(this.i18n.translate('NOTICE.PUBLISHED_ERR'), 'error');
    } finally {
      this.publishSubmitting = false;
    }
  }

  confirmDelete(row: NoticeDto): void {
    this.deleteTarget = row;
    this.deleteOpen = true;
  }

  closeDelete(): void {
    this.deleteOpen = false;
    this.deleteTarget = null;
  }

  async submitDelete(): Promise<void> {
    if (!this.deleteTarget) {
      return;
    }
    const admin = this.adminSession.get();
    if (!admin?.id) {
      this.toast.show(this.i18n.translate('NOTICE.DELETED_ERR'), 'error');
      return;
    }
    this.deleteSubmitting = true;
    try {
      await firstValueFrom(
        this.noticesApi.delete(this.deleteTarget.id, {
          staffUserId: admin.id
        })
      );
      this.toast.show(this.i18n.translate('NOTICE.DELETED_OK'), 'success');
      this.closeDelete();
      await this.load();
    } catch {
      this.toast.show(this.i18n.translate('NOTICE.DELETED_ERR'), 'error');
    } finally {
      this.deleteSubmitting = false;
    }
  }

  printNotice(row: NoticeDto): void {
    const tenant = this.tenantStore.getTenant();
    const gpName = tenant?.name?.trim() || 'ग्रामपंचायत';
    const dateLabel = this.formatDate(row.publishedOn);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${this.escapeHtml(row.title)}</title>
<style>body{font-family:'Noto Sans Devanagari',Arial,sans-serif;margin:40px;color:#111;line-height:1.7}
h2{font-size:20px;text-align:center;margin-bottom:4px}.sub{text-align:center;font-size:13px;color:#555;margin-bottom:20px}
hr{margin:16px 0}.body{font-size:14px;white-space:pre-line}</style></head><body>
<h2>${this.escapeHtml(gpName)}</h2><div class="sub">📅 ${this.escapeHtml(dateLabel)}</div><hr>
<h3 style="text-align:center;font-size:17px">📢 ${this.escapeHtml(row.title)}</h3>
<div class="body">${this.escapeHtml(row.body).replace(/\n/g, '<br>')}</div>
<script>window.onload=function(){window.print();}</script></body></html>`;
    const w = window.open('', '_blank');
    if (!w) {
      return;
    }
    w.document.write(html);
    w.document.close();
  }

  whatsAppShare(row: NoticeDto, audience: 'citizens' | 'members'): void {
    const tenant = this.tenantStore.getTenant();
    const gpName = tenant?.name?.trim() || 'ग्रामपंचायत';
    const dateLabel = this.formatDate(row.publishedOn);
    const msg = `📢 *${row.title}*\n\n${row.body}\n\n──────────\n📅 ${dateLabel}\n🏻️ ${gpName}`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
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

  private todayIso(): string {
    return isoDateOnly(new Date());
  }

  private defaultExpiresOn(publishedOn = this.todayIso()): string {
    return addDaysIso(publishedOn, 30);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
