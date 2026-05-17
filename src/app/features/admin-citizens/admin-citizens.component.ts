import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { AdminSessionService } from '../../core/admin-session.service';
import { canManageCitizenRegister } from '../../core/admin-staff-role.util';
import { CitizenService } from '../../core/citizen.service';
import {
  calcCitizenAgeYears,
  CITIZEN_REGISTER_FILTERS,
  CITIZEN_STATUSES,
  CitizenDto,
  CitizenRegisterFilter,
  CitizenStatsDto,
  CitizenStatus,
  citizenDtoDisplayName,
  citizenRegisterFilterLabelKey,
  citizenStatusLabelKey,
  GenderType,
  genderLabelKey,
  GENDER_TYPES
} from '../../core/citizen.models';
import { ToastService } from '../../core/toast.service';
import { I18nService } from '../../i18n/i18n.service';
import { GramAppHeaderComponent } from '../../shared/components/gram-app-header/gram-app-header.component';

@Component({
  selector: 'app-admin-citizens',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    GramAppHeaderComponent
  ],
  templateUrl: './admin-citizens.component.html',
  styleUrls: ['./admin-citizens.component.scss']
})
export class AdminCitizensComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly citizenApi = inject(CitizenService);
  private readonly adminSession = inject(AdminSessionService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly filterOptions = CITIZEN_REGISTER_FILTERS;
  readonly genderOptions = GENDER_TYPES;
  readonly statusOptions = CITIZEN_STATUSES;
  readonly citizenRegisterFilterLabelKey = citizenRegisterFilterLabelKey;
  readonly genderLabelKey = genderLabelKey;
  readonly citizenStatusLabelKey = citizenStatusLabelKey;
  readonly citizenDtoDisplayName = citizenDtoDisplayName;
  readonly calcCitizenAgeYears = calcCitizenAgeYears;

  adminDisplayName: string | null = null;
  loading = false;
  rows: CitizenDto[] = [];
  stats: CitizenStatsDto | null = null;
  searchQuery = '';
  statusFilter: CitizenRegisterFilter = 'active';
  genderFilter: GenderType | '' = '';

  editorOpen = false;
  editorSubmitting = false;
  editorTargetId: string | null = null;

  readonly editorForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    gender: ['male' as GenderType, Validators.required],
    dateOfBirth: ['', Validators.required],
    fatherName: [''],
    houseNo: [''],
    ward: [''],
    mobile: [''],
    voterId: [''],
    rationCardNumber: [''],
    bpl: [false],
    bplCardNumber: [''],
    annualIncome: [null as number | null],
    disabled: [false],
    disabilityType: [''],
    status: ['active' as CitizenStatus, Validators.required]
  });

  ngOnInit(): void {
    const admin = this.adminSession.get();
    if (!admin) {
      void this.router.navigate(['/login']);
      return;
    }
    if (!canManageCitizenRegister(admin)) {
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

  async load(): Promise<void> {
    this.loading = true;
    try {
      const res = await firstValueFrom(
        this.citizenApi.listRegister({
          search: this.searchQuery,
          gender: this.genderFilter || null,
          filter: this.statusFilter
        })
      );
      this.rows = res.citizens;
      this.stats = res.stats;
    } catch {
      this.toast.show(this.i18n.translate('ADMIN_CITIZENS.ERR_LOAD'), 'error');
    } finally {
      this.loading = false;
    }
  }

  onFiltersChanged(): void {
    void this.load();
  }

  applyStatsFilter(filter: CitizenRegisterFilter): void {
    this.statusFilter = filter;
    void this.load();
  }

  applyGenderFilter(gender: GenderType | ''): void {
    this.genderFilter = gender;
    void this.load();
  }

  isStatusFilterActive(filter: CitizenRegisterFilter): boolean {
    return this.statusFilter === filter;
  }

  isGenderFilterActive(gender: GenderType): boolean {
    return this.genderFilter === gender;
  }

  openCreate(): void {
    this.editorTargetId = null;
    this.editorForm.reset({
      fullName: '',
      gender: 'male',
      dateOfBirth: '',
      fatherName: '',
      houseNo: '',
      ward: '',
      mobile: '',
      voterId: '',
      rationCardNumber: '',
      bpl: false,
      bplCardNumber: '',
      annualIncome: null,
      disabled: false,
      disabilityType: '',
      status: 'active'
    });
    this.editorOpen = true;
  }

  openEdit(row: CitizenDto): void {
    this.editorTargetId = row.id;
    this.editorForm.reset({
      fullName: citizenDtoDisplayName(row),
      gender: row.gender,
      dateOfBirth: row.dateOfBirth ?? '',
      fatherName: row.middleName ?? '',
      houseNo: row.addressLine1 ?? '',
      ward: row.wardNumber ?? '',
      mobile: row.mobile ?? '',
      voterId: row.voterId ?? '',
      rationCardNumber: row.rationCardNumber ?? '',
      bpl: row.bpl,
      bplCardNumber: row.bplCardNumber ?? '',
      annualIncome: row.annualIncome ?? null,
      disabled: row.disabled,
      disabilityType: row.disabilityType ?? '',
      status: row.status
    });
    this.editorOpen = true;
  }

  closeEditor(): void {
    this.editorOpen = false;
    this.editorTargetId = null;
  }

  async saveEditor(): Promise<void> {
    if (this.editorForm.invalid) {
      this.editorForm.markAllAsTouched();
      return;
    }
    const admin = this.adminSession.get();
    if (!admin) {
      return;
    }
    const v = this.editorForm.getRawValue();
    const names = this.splitFullName(v.fullName);
    if (!names) {
      this.toast.show(this.i18n.translate('ADMIN_CITIZENS.ERR_NAME'), 'error');
      return;
    }
    const payload = {
      firstName: names.firstName,
      middleName: v.fatherName.trim() || null,
      lastName: names.lastName,
      dateOfBirth: v.dateOfBirth,
      gender: v.gender,
      addressLine1: v.houseNo.trim() || null,
      wardNumber: v.ward.trim() || null,
      mobile: v.mobile.trim() || null,
      voterId: v.voterId.trim() || null,
      rationCardNumber: v.rationCardNumber.trim() || null,
      bpl: v.bpl,
      bplCardNumber: v.bplCardNumber.trim() || null,
      annualIncome: v.annualIncome,
      disabled: v.disabled,
      disabilityType: v.disabilityType.trim() || null,
      status: v.status
    };
    this.editorSubmitting = true;
    try {
      if (this.editorTargetId) {
        await firstValueFrom(
          this.citizenApi.update(this.editorTargetId, {
            staffUserId: admin.id,
            citizen: payload
          })
        );
        this.toast.show(this.i18n.translate('ADMIN_CITIZENS.SAVED'), 'success');
      } else {
        await firstValueFrom(
          this.citizenApi.create({
            staffUserId: admin.id,
            citizen: payload
          })
        );
        this.toast.show(this.i18n.translate('ADMIN_CITIZENS.CREATED'), 'success');
      }
      this.closeEditor();
      await this.load();
    } catch {
      this.toast.show(this.i18n.translate('ADMIN_CITIZENS.ERR_SAVE'), 'error');
    } finally {
      this.editorSubmitting = false;
    }
  }

  quickSetStatus(row: CitizenDto, status: CitizenStatus): void {
    const admin = this.adminSession.get();
    if (!admin) {
      return;
    }
    const payload = {
      firstName: row.firstName,
      middleName: row.middleName ?? null,
      lastName: row.lastName,
      dateOfBirth: row.dateOfBirth ?? '',
      gender: row.gender,
      addressLine1: row.addressLine1 ?? null,
      wardNumber: row.wardNumber ?? null,
      mobile: row.mobile ?? null,
      voterId: row.voterId ?? null,
      rationCardNumber: row.rationCardNumber ?? null,
      bpl: row.bpl,
      bplCardNumber: row.bplCardNumber ?? null,
      annualIncome: row.annualIncome ?? null,
      disabled: row.disabled,
      disabilityType: row.disabilityType ?? null,
      status
    };
    void firstValueFrom(
      this.citizenApi.update(row.id, { staffUserId: admin.id, citizen: payload })
    )
      .then(() => {
        this.toast.show(this.i18n.translate('ADMIN_CITIZENS.SAVED'), 'success');
        return this.load();
      })
      .catch(() => this.toast.show(this.i18n.translate('ADMIN_CITIZENS.ERR_SAVE'), 'error'));
  }

  private splitFullName(full: string): { firstName: string; lastName: string } | null {
    const parts = full.trim().split(/\s+/).filter((p) => p.length > 0);
    if (parts.length < 2) {
      return null;
    }
    return {
      firstName: parts[0],
      lastName: parts[parts.length - 1]
    };
  }
}
