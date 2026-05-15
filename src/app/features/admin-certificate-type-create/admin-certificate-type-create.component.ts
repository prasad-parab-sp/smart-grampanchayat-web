import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AdminSessionService } from '../../core/admin-session.service';
import { CertificateTypeService } from '../../core/certificate-type.service';
import {
  CertificateTypeCategory,
  CertificateTypeFieldUpsertRequest,
  CertificateTypeUpsertRequest
} from '../../core/certificate-type.models';
import { I18nService } from '../../i18n/i18n.service';
import { ToastService } from '../../core/toast.service';
import { GramAppHeaderComponent } from '../../shared/components/gram-app-header/gram-app-header.component';
import { ICONS } from '../../shared';

const MAX_EXTRA_FIELDS = 40;

@Component({
  selector: 'app-admin-certificate-type-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, GramAppHeaderComponent],
  templateUrl: './admin-certificate-type-create.component.html',
  styleUrls: ['./admin-certificate-type-create.component.scss']
})
export class AdminCertificateTypeCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly certificateTypes = inject(CertificateTypeService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  adminDisplayName: string | null = null;
  adminRoleLabel: string | null = null;
  readonly icons = ICONS;
  readonly categories = Object.values(CertificateTypeCategory);
  readonly dataTypes = ['TEXT', 'TEXTAREA', 'DATE', 'NUMBER', 'SELECT', 'FILE'] as const;

  submitting = false;

  readonly form = this.fb.nonNullable.group({
    code: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(64), Validators.pattern(/^[a-z][a-z0-9_]*$/)]
    ],
    category: [CertificateTypeCategory.CERTIFICATE, Validators.required],
    nameMr: ['', [Validators.required, Validators.maxLength(300)]],
    nameEn: ['', [Validators.required, Validators.maxLength(300)]],
    descriptionMr: ['', [Validators.required, Validators.maxLength(4000)]],
    descriptionEn: ['', [Validators.required, Validators.maxLength(4000)]],
    extraFieldsSectionTitleMr: ['', [Validators.required, Validators.maxLength(300)]],
    extraFieldsSectionTitleEn: ['', [Validators.required, Validators.maxLength(300)]],
    defaultFeeAmount: [0, [Validators.required, Validators.min(0)]],
    estimatedDaysTxt: ['', [Validators.required, Validators.maxLength(80)]],
    icon: ['', Validators.maxLength(32)],
    sortOrder: [100, Validators.required],
    active: [true],
    extraFields: this.fb.array<FormGroup>([])
  });

  constructor(
    private readonly adminSession: AdminSessionService,
    private readonly router: Router
  ) {}

  get extraFields(): FormArray {
    return this.form.controls.extraFields as FormArray;
  }

  ngOnInit(): void {
    const admin = this.adminSession.get();
    if (!admin) {
      void this.router.navigate(['/login']);
      return;
    }
    if (admin.storedRole !== 'GP_ADMIN') {
      void this.router.navigate(['/admin/home']);
      return;
    }
    this.adminDisplayName = `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim() || null;
    this.adminRoleLabel = admin.role?.trim().replaceAll('_', ' ') || null;
  }

  logout(): void {
    this.adminSession.clear();
    void this.router.navigate(['/login']);
  }

  openAdminHome(): void {
    void this.router.navigate(['/admin/home']);
  }

  private nextExtraSortOrder(): number {
    let max = 0;
    for (const c of this.extraFields.controls) {
      const n = Number(c.get('sortOrder')?.value);
      if (!Number.isNaN(n)) {
        max = Math.max(max, n);
      }
    }
    return max > 0 ? max + 10 : 10;
  }

  addExtraFieldRow(): void {
    if (this.extraFields.length >= MAX_EXTRA_FIELDS) {
      return;
    }
    this.extraFields.push(this.createExtraFieldGroup(this.nextExtraSortOrder()));
  }

  removeExtraFieldRow(index: number): void {
    this.extraFields.removeAt(index);
  }

  private createExtraFieldGroup(sortOrder: number): FormGroup {
    return this.fb.nonNullable.group({
      fieldKey: [
        '',
        [Validators.required, Validators.pattern(/^[a-z][a-z0-9_]*$/), Validators.maxLength(120)]
      ],
      labelMr: ['', [Validators.required, Validators.maxLength(500)]],
      labelEn: ['', Validators.maxLength(500)],
      placeholderMr: ['', Validators.maxLength(500)],
      placeholderEn: ['', Validators.maxLength(500)],
      helpTextMr: [''],
      helpTextEn: [''],
      dataType: ['TEXT', Validators.required],
      required: [false],
      sortOrder: [sortOrder, Validators.required],
      optionsJsonText: [''],
      maxFiles: [1, [Validators.min(1), Validators.max(20)]],
      maxBytes: [5242880, [Validators.min(1)]]
    });
  }

  rowDataType(index: number): string {
    return String(this.extraFields.at(index)?.get('dataType')?.value ?? 'TEXT');
  }

  private opt(s: string | null | undefined, max?: number): string | null {
    const t = (s ?? '').trim();
    if (!t) {
      return null;
    }
    if (max != null && t.length > max) {
      return t.slice(0, max);
    }
    return t;
  }

  private validateSelectOptions(): boolean {
    for (let i = 0; i < this.extraFields.length; i++) {
      const g = this.extraFields.at(i) as FormGroup;
      if (g.get('dataType')?.value !== 'SELECT') {
        continue;
      }
      const raw = String(g.get('optionsJsonText')?.value ?? '').trim();
      if (!raw) {
        this.toast.show(this.i18n.translate('ADMIN_CERT_TYPE_CREATE.ERR_SELECT_OPTIONS'), 'error');
        g.get('optionsJsonText')?.markAsTouched();
        return false;
      }
      try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          this.toast.show(this.i18n.translate('ADMIN_CERT_TYPE_CREATE.ERR_SELECT_OPTIONS'), 'error');
          return false;
        }
      } catch {
        this.toast.show(this.i18n.translate('ADMIN_CERT_TYPE_CREATE.ERR_SELECT_JSON'), 'error');
        return false;
      }
    }
    return true;
  }

  private buildExtraFieldsPayload(): CertificateTypeFieldUpsertRequest[] {
    const out: CertificateTypeFieldUpsertRequest[] = [];
    for (const c of this.extraFields.controls) {
      const g = c as FormGroup;
      const v = g.getRawValue() as {
        fieldKey: string;
        labelMr: string;
        labelEn: string;
        placeholderMr: string;
        placeholderEn: string;
        helpTextMr: string;
        helpTextEn: string;
        dataType: string;
        required: boolean;
        sortOrder: number;
        optionsJsonText: string;
        maxFiles: number;
        maxBytes: number;
      };
      const dataType = v.dataType;
      const row: CertificateTypeFieldUpsertRequest = {
        fieldKey: v.fieldKey.trim(),
        labelMr: v.labelMr.trim(),
        labelEn: this.opt(v.labelEn, 500),
        placeholderMr: this.opt(v.placeholderMr, 500),
        placeholderEn: this.opt(v.placeholderEn, 500),
        helpTextMr: this.opt(v.helpTextMr) ?? undefined,
        helpTextEn: this.opt(v.helpTextEn) ?? undefined,
        dataType,
        required: Boolean(v.required),
        sortOrder: Math.trunc(Number(v.sortOrder)) || 0,
        optionsJson: dataType === 'SELECT' ? JSON.parse(String(v.optionsJsonText).trim()) : null,
        maxFiles: dataType === 'FILE' ? Math.trunc(Number(v.maxFiles)) || 1 : null,
        maxBytes: dataType === 'FILE' ? Number(v.maxBytes) || 5242880 : null
      };
      out.push(row);
    }
    return out;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.validateSelectOptions()) {
      return;
    }
    const v = this.form.getRawValue();
    const iconTrimmed = this.opt(v.icon, 32);
    const body: CertificateTypeUpsertRequest = {
      code: v.code.trim(),
      category: v.category,
      nameMr: v.nameMr.trim(),
      nameEn: v.nameEn.trim(),
      descriptionMr: v.descriptionMr.trim(),
      descriptionEn: v.descriptionEn.trim(),
      extraFieldsSectionTitleMr: v.extraFieldsSectionTitleMr.trim(),
      extraFieldsSectionTitleEn: v.extraFieldsSectionTitleEn.trim(),
      defaultFeeAmount: Number(v.defaultFeeAmount),
      estimatedDaysTxt: v.estimatedDaysTxt.trim(),
      icon: iconTrimmed,
      sortOrder: Math.trunc(Number(v.sortOrder)) || 0,
      active: v.active,
      extraFields: this.buildExtraFieldsPayload()
    };
    this.submitting = true;
    try {
      await firstValueFrom(this.certificateTypes.create(body));
      this.toast.show(this.i18n.translate('ADMIN_CERT_TYPE_CREATE.SUCCESS'), 'success');
      void this.router.navigate(['/admin/home']);
    } catch (err) {
      const status = (err as HttpErrorResponse | undefined)?.status ?? 0;
      if (status === 409) {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_CERT_TYPE_CREATE.ERR_CONFLICT')}`, 'error');
      } else if (status === 400) {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_CERT_TYPE_CREATE.ERR_VALIDATION')}`, 'error');
      } else {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_CERT_TYPE_CREATE.ERR_GENERIC')}`, 'error');
      }
    } finally {
      this.submitting = false;
    }
  }
}
