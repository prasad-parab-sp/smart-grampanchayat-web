import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { CertificateApplicationService } from '../../../core/certificate-application.service';
import type { CertificateApplicationDto, CertificateStaffRemarkDto } from '../../../core/certificate-application.models';
import { I18nService } from '../../../i18n/i18n.service';
import { ToastService } from '../../../core/toast.service';
import { ICONS } from '../../constants/icons';

@Component({
  selector: 'app-certificate-application-detail-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './certificate-application-detail-sheet.component.html',
  styleUrls: ['./certificate-application-detail-sheet.component.scss']
})
export class CertificateApplicationDetailSheetComponent implements OnChanges {
  private readonly certificateApplications = inject(CertificateApplicationService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly icons = ICONS;

  @Input() open = false;
  @Input() loading = false;
  @Input() application: CertificateApplicationDto | null = null;
  @Input() certificateTypeLabel = '';
  @Input() statusLabel = '';
  /** When true, Gramsevak can append remarks from this sheet (credentials required). */
  @Input() canAppendStaffRemarks = false;
  @Input() defaultStaffLoginIdentifier: string | null = null;

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly staffRemarksUpdated = new EventEmitter<CertificateApplicationDto>();

  remarkAppendDraft = '';
  remarkAppendIdentifier = '';
  remarkAppendPassword = '';
  remarkAppendSubmitting = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === true && this.defaultStaffLoginIdentifier?.trim()) {
      this.remarkAppendIdentifier = this.defaultStaffLoginIdentifier.trim();
    }
  }

  dismiss(): void {
    this.closed.emit();
  }

  sortedStaffRemarks(): CertificateStaffRemarkDto[] {
    const list = this.application?.staffRemarks;
    if (!list?.length) {
      return [];
    }
    return [...list].sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return ta - tb;
    });
  }

  formatDateTime(iso: string | null | undefined): string {
    if (!iso?.trim()) {
      return '';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    try {
      const loc = this.i18n.currentLang === 'mr' ? 'mr-IN' : 'en-IN';
      return d.toLocaleString(loc, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return d.toLocaleString();
    }
  }

  formatExtraValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  extraFieldEntries(): { key: string; value: string }[] {
    const raw = this.application?.additionalValues;
    if (!raw || typeof raw !== 'object') {
      return [];
    }
    return Object.keys(raw)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => ({ key, value: this.formatExtraValue((raw as Record<string, unknown>)[key]) }));
  }

  async submitStaffRemarks(): Promise<void> {
    const app = this.application;
    if (!app || !this.canAppendStaffRemarks) {
      return;
    }
    const lines = this.remarkAppendDraft
      .split(/\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (!lines.length) {
      this.toast.show(this.i18n.translate('ADMIN_CERT_APP_DETAIL.ERR_REMARK_EMPTY'), 'error');
      return;
    }
    if (lines.length > 20) {
      this.toast.show(this.i18n.translate('ADMIN_CERT_APP_DETAIL.ERR_REMARK_TOO_MANY'), 'error');
      return;
    }
    const identifier = this.remarkAppendIdentifier.trim();
    const password = this.remarkAppendPassword;
    if (!identifier || !password) {
      this.toast.show(this.i18n.translate('ADMIN_CERT_APP_DETAIL.ERR_REMARK_AUTH'), 'error');
      return;
    }
    this.remarkAppendSubmitting = true;
    try {
      const dto = await firstValueFrom(
        this.certificateApplications.appendStaffRemarks(app.id, {
          identifier,
          password,
          texts: lines
        })
      );
      this.toast.show(this.i18n.translate('ADMIN_CERT_APP_DETAIL.REMARK_SAVED'), 'success');
      this.remarkAppendDraft = '';
      this.remarkAppendPassword = '';
      this.staffRemarksUpdated.emit(dto);
    } catch (err) {
      const status = (err as HttpErrorResponse | undefined)?.status ?? 0;
      if (status === 401) {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_HOME.PENDING_CERT_ERR_AUTH')}`, 'error');
      } else if (status === 403) {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_HOME.PENDING_CERT_ERR_FORBIDDEN')}`, 'error');
      } else if (status === 409) {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_CERT_APP_DETAIL.ERR_REMARK_STATUS')}`, 'error');
      } else {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_CERT_APP_DETAIL.ERR_REMARK_GENERIC')}`, 'error');
      }
    } finally {
      this.remarkAppendSubmitting = false;
    }
  }
}
