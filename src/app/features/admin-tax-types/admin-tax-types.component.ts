import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { AdminSessionService } from '../../core/admin-session.service';
import { TaxService } from '../../core/tax.service';
import type { TaxTypeDto } from '../../core/tax.models';
import { ToastService } from '../../core/toast.service';
import { I18nService } from '../../i18n/i18n.service';
import { GramAppHeaderComponent } from '../../shared/components/gram-app-header/gram-app-header.component';

@Component({
  selector: 'app-admin-tax-types',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, GramAppHeaderComponent],
  templateUrl: './admin-tax-types.component.html',
  styleUrls: ['./admin-tax-types.component.scss']
})
export class AdminTaxTypesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taxApi = inject(TaxService);
  private readonly adminSession = inject(AdminSessionService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  adminDisplayName: string | null = null;
  canManage = false;
  loading = false;
  rows: TaxTypeDto[] = [];

  editorOpen = false;
  editorSubmitting = false;
  editTarget: TaxTypeDto | null = null;

  readonly editorForm = this.fb.nonNullable.group({
    nameEn: ['', Validators.required],
    nameMr: ['', Validators.required],
    description: [''],
    active: [true]
  });

  ngOnInit(): void {
    const admin = this.adminSession.get();
    if (!admin) {
      void this.router.navigate(['/login']);
      return;
    }
    const role = admin.storedRole;
    this.canManage = role === 'GP_ADMIN' || role === 'GRAMSEVAK' || role === 'SYS_ADMIN';
    if (!this.canManage) {
      void this.router.navigate(['/admin/home']);
      return;
    }
    this.adminDisplayName = `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim() || null;
    void this.load();
  }

  logout(): void {
    this.adminSession.clear();
    void this.router.navigate(['/login']);
  }

  openAdminHome(): void {
    void this.router.navigate(['/admin/home']);
  }

  async load(): Promise<void> {
    this.loading = true;
    try {
      this.rows = await firstValueFrom(this.taxApi.listTaxTypes(false));
    } catch {
      this.toast.show(this.i18n.translate('ADMIN_TAX_TYPES.ERR_LOAD'), 'error');
      this.rows = [];
    } finally {
      this.loading = false;
    }
  }

  openCreate(): void {
    this.editTarget = null;
    this.editorForm.reset({ nameEn: '', nameMr: '', description: '', active: true });
    this.editorOpen = true;
  }

  openEdit(row: TaxTypeDto): void {
    this.editTarget = row;
    this.editorForm.reset({
      nameEn: row.nameEn,
      nameMr: row.nameMr,
      description: row.description ?? '',
      active: row.active
    });
    this.editorOpen = true;
  }

  closeEditor(): void {
    this.editorOpen = false;
    this.editTarget = null;
  }

  async submitEditor(): Promise<void> {
    if (this.editorForm.invalid) {
      this.editorForm.markAllAsTouched();
      return;
    }
    const admin = this.adminSession.get();
    if (!admin) {
      return;
    }
    const v = this.editorForm.getRawValue();
    const taxType = {
      nameEn: v.nameEn.trim(),
      nameMr: v.nameMr.trim(),
      description: v.description?.trim() || null,
      active: v.active
    };
    this.editorSubmitting = true;
    try {
      if (this.editTarget) {
        await firstValueFrom(
          this.taxApi.patchTaxType(this.editTarget.id, {
            staffUserId: admin.id,
            taxType
          })
        );
        this.toast.show(this.i18n.translate('ADMIN_TAX_TYPES.SAVED'), 'success');
      } else {
        await firstValueFrom(
          this.taxApi.createTaxType({
            staffUserId: admin.id,
            taxType
          })
        );
        this.toast.show(this.i18n.translate('ADMIN_TAX_TYPES.CREATED'), 'success');
      }
      this.closeEditor();
      await this.load();
    } catch {
      this.toast.show(this.i18n.translate('ADMIN_TAX_TYPES.ERR_SAVE'), 'error');
    } finally {
      this.editorSubmitting = false;
    }
  }

  labelFor(row: TaxTypeDto): string {
    const lang = this.i18n.currentLang === 'mr' ? 'mr' : 'en';
    return lang === 'mr' ? row.nameMr?.trim() || row.nameEn : row.nameEn?.trim() || row.nameMr;
  }
}
