import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AdminSessionService } from '../../core/admin-session.service';
import { CertificateTypeService } from '../../core/certificate-type.service';
import type { CertificateTypeDto } from '../../core/certificate-type.models';
import { I18nService } from '../../i18n/i18n.service';
import { ToastService } from '../../core/toast.service';
import { GramAppHeaderComponent } from '../../shared/components/gram-app-header/gram-app-header.component';
import { ICONS } from '../../shared';

@Component({
  selector: 'app-admin-certificate-type-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, GramAppHeaderComponent],
  templateUrl: './admin-certificate-type-list.component.html',
  styleUrls: ['./admin-certificate-type-list.component.scss']
})
export class AdminCertificateTypeListComponent implements OnInit {
  private readonly certificateTypes = inject(CertificateTypeService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  adminDisplayName: string | null = null;
  adminRoleLabel: string | null = null;
  readonly icons = ICONS;

  loading = false;
  rows: CertificateTypeDto[] = [];

  constructor(
    private readonly adminSession: AdminSessionService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const admin = this.adminSession.get();
    if (!admin) {
      void this.router.navigate(['/login']);
      return;
    }
    if (admin.storedRole !== 'GP_ADMIN' && admin.storedRole !== 'SYS_ADMIN') {
      void this.router.navigate(['/admin/home']);
      return;
    }
    this.adminDisplayName = `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim() || null;
    this.adminRoleLabel = admin.role?.trim().replaceAll('_', ' ') || null;
    void this.loadRows();
  }

  logout(): void {
    this.adminSession.clear();
    void this.router.navigate(['/login']);
  }

  openAdminHome(): void {
    void this.router.navigate(['/admin/home']);
  }

  openCreate(): void {
    void this.router.navigate(['/admin/certificate-types/new']);
  }

  openEdit(row: CertificateTypeDto): void {
    void this.router.navigate(['/admin/certificate-types', row.id, 'edit']);
  }

  labelFor(row: CertificateTypeDto): string {
    const en = row.nameEn?.trim();
    const mr = row.nameMr?.trim();
    return en || mr || row.code;
  }

  isActive(row: CertificateTypeDto): boolean {
    return row.active ?? row.isActive ?? true;
  }

  trackRow(_index: number, row: CertificateTypeDto): string {
    return row.id;
  }

  private async loadRows(): Promise<void> {
    this.loading = true;
    try {
      this.rows = await firstValueFrom(this.certificateTypes.listTenantOwned());
    } catch {
      this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('ADMIN_CERT_TYPE_LIST.ERR_LOAD')}`, 'error');
      this.rows = [];
    } finally {
      this.loading = false;
    }
  }
}
