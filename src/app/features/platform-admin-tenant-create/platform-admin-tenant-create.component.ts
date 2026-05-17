import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { PlatformTenantService } from '../../core/platform-tenant.service';
import { ToastService } from '../../core/toast.service';
import { I18nService } from '../../i18n/i18n.service';
import { ICONS } from '../../shared';

@Component({
  selector: 'app-platform-admin-tenant-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink],
  templateUrl: './platform-admin-tenant-create.component.html',
  styleUrls: ['./platform-admin-tenant-create.component.scss']
})
export class PlatformAdminTenantCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly tenants = inject(PlatformTenantService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly icons = ICONS;
  pending = false;
  lastCreatedCode: string | null = null;

  readonly form = this.fb.group({
    districtCode: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
    tenantCode: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(10)]),
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(255)]),
    gpCode: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(64)]),
    displayNameEn: this.fb.control(''),
    displayNameMr: this.fb.control(''),
    talukaEn: this.fb.control(''),
    talukaMr: this.fb.control(''),
    status: this.fb.nonNullable.control('trial'),
    planType: this.fb.nonNullable.control('basic'),
    maxUsers: this.fb.control<number | null>(null),
    contactEmail: this.fb.control(''),
    contactPhone: this.fb.control('')
  });

  async submit(): Promise<void> {
    if (this.pending || this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.invalid) {
        this.toast.show(this.i18n.translate('PLATFORM_ADMIN.TENANT.ERROR_VALIDATION'), 'error');
      }
      return;
    }

    const v = this.form.getRawValue();
    this.pending = true;
    try {
      const created = await firstValueFrom(
        this.tenants.createTenant({
          districtCode: v.districtCode.trim(),
          tenantCode: v.tenantCode.trim(),
          name: v.name.trim(),
          gpCode: v.gpCode.trim(),
          displayNameEn: v.displayNameEn?.trim() || null,
          displayNameMr: v.displayNameMr?.trim() || null,
          talukaEn: v.talukaEn?.trim() || null,
          talukaMr: v.talukaMr?.trim() || null,
          status: v.status,
          planType: v.planType,
          maxUsers: v.maxUsers ?? null,
          contactEmail: v.contactEmail?.trim() || null,
          contactPhone: v.contactPhone?.trim() || null
        })
      );
      this.lastCreatedCode = created.tenantCode;
      this.toast.show(
        `${this.icons.SUCCESS} ${this.i18n.translate('PLATFORM_ADMIN.TENANT.SUCCESS', { code: created.tenantCode })}`,
        'success'
      );
      this.form.reset({
        districtCode: v.districtCode,
        tenantCode: '',
        name: '',
        gpCode: '',
        displayNameEn: '',
        displayNameMr: '',
        talukaEn: '',
        talukaMr: '',
        status: 'trial',
        planType: 'basic',
        maxUsers: null,
        contactEmail: '',
        contactPhone: ''
      });
    } catch (err) {
      const status = (err as HttpErrorResponse)?.status ?? 0;
      let key = 'PLATFORM_ADMIN.TENANT.ERROR_SERVER';
      if (status === 409) {
        key = 'PLATFORM_ADMIN.TENANT.ERROR_CONFLICT';
      } else if (status === 404) {
        key = 'PLATFORM_ADMIN.TENANT.ERROR_DISTRICT';
      } else if (status === 503) {
        key = 'PLATFORM_ADMIN.TENANT.ERROR_SHARD';
      }
      this.toast.show(`${this.icons.ERROR} ${this.i18n.translate(key)}`, 'error');
    } finally {
      this.pending = false;
    }
  }
}
