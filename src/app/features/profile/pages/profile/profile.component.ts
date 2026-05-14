import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { CertificateApplicationService } from '../../../../core/certificate-application.service';
import {
  CertificateApplicationDto,
  CertificateApplicationStatus
} from '../../../../core/certificate-application.models';
import { CertificateTypeService } from '../../../../core/certificate-type.service';
import { CertificateTypeDto } from '../../../../core/certificate-type.models';
import { CitizenService } from '../../../../core/citizen.service';
import { citizenFullDisplayName } from '../../../../core/citizen-name.util';
import { Citizen } from '../../../../core/citizen.models';
import { LoggedInCitizenService } from '../../../../core/logged-in-citizen.service';
import { ToastService } from '../../../../core/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  citizen: Citizen | null = null;
  applications: CertificateApplicationDto[] = [];
  loading = true;
  loadError = false;

  private typeById = new Map<string, CertificateTypeDto>();

  /** At most three cards on the profile; full history is on the certificate “My applications” page. */
  get applicationsPreview(): CertificateApplicationDto[] {
    return this.applications.slice(0, 3);
  }

  constructor(
    private readonly router: Router,
    private readonly loggedInCitizen: LoggedInCitizenService,
    private readonly citizenService: CitizenService,
    private readonly certificateApplicationService: CertificateApplicationService,
    private readonly certificateTypeService: CertificateTypeService,
    private readonly translate: TranslateService,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    void this.bootstrap();
  }

  async bootstrap(): Promise<void> {
    const id = this.loggedInCitizen.getCurrentLoggedInCitizenId();
    if (!id) {
      void this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.loadError = false;
    try {
      const citizen = await firstValueFrom(this.citizenService.getById(id));

      if (!citizen) {
        this.loggedInCitizen.clearSession();
        void this.router.navigate(['/login']);
        return;
      }

      this.citizen = citizen;
      this.loggedInCitizen.setBadgeDisplayName(citizen);

      try {
        const [types, apps] = await Promise.all([
          firstValueFrom(this.certificateTypeService.list()),
          firstValueFrom(this.certificateApplicationService.list(id))
        ]);
        this.typeById = new Map(types.map((t) => [t.id, t]));
        this.applications = apps ?? [];
      } catch {
        this.typeById = new Map();
        this.applications = [];
        this.toast.show(this.translate.instant('PROFILE.ERROR_APPLICATIONS'), 'error');
      }
    } catch {
      this.loadError = true;
      this.toast.show(this.translate.instant('PROFILE.ERROR_LOAD'), 'error');
    } finally {
      this.loading = false;
    }
  }

  displayName(): string {
    return this.citizen ? citizenFullDisplayName(this.citizen) : '—';
  }

  certificateTypeLabel(typeId: string): string {
    const t = this.typeById.get(typeId);
    if (!t) {
      return typeId;
    }
    const lang = this.translate.currentLang || this.translate.getDefaultLang();
    if (lang === 'en' && t.nameEn?.trim()) {
      return t.nameEn.trim();
    }
    return t.nameMr?.trim() || t.code;
  }

  statusBadgeClass(status: CertificateApplicationStatus): string {
    switch (status) {
      case 'APPROVED':
        return 'badge-g';
      case 'REJECTED':
      case 'CANCELLED':
        return 'badge-r';
      default:
        return 'badge-o';
    }
  }

  statusLabel(status: CertificateApplicationStatus): string {
    const key = `PROFILE.STATUS_${status}` as const;
    const t = this.translate.instant(key);
    return t !== key ? t : status;
  }

  formatSubmittedAt(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    try {
      return d.toLocaleDateString(this.translate.currentLang === 'mr' ? 'mr-IN' : 'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return d.toLocaleDateString();
    }
  }

  logout(): void {
    this.loggedInCitizen.clearSession();
    void this.router.navigate(['/login']);
  }

  onPaymentNotifyClick(): void {
    this.toast.show(this.translate.instant('PROFILE.PAYMENT_NOTIFY_SOON'), 'error');
  }
}
