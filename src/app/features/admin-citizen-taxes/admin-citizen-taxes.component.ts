import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { AdminSessionService } from '../../core/admin-session.service';
import { CitizenService } from '../../core/citizen.service';
import { Citizen } from '../../core/citizen.models';

interface SelectedCitizen {
  id: string;
  label: string;
}
import { TaxService } from '../../core/tax.service';
import {
  CITIZEN_TAX_STATUSES,
  CitizenTaxDto,
  CitizenTaxStatus,
  currentFinancialYear,
  citizenTaxDisplayName,
  taxStatusLabelKey,
  taxTypeDisplayName,
  TAX_PAYMENT_MODES,
  TaxPaymentDto,
  TaxTypeDto
} from '../../core/tax.models';
import { ToastService } from '../../core/toast.service';
import { I18nService } from '../../i18n/i18n.service';
import { GramAppHeaderComponent } from '../../shared/components/gram-app-header/gram-app-header.component';

@Component({
  selector: 'app-admin-citizen-taxes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    GramAppHeaderComponent
  ],
  templateUrl: './admin-citizen-taxes.component.html',
  styleUrls: ['./admin-citizen-taxes.component.scss']
})
export class AdminCitizenTaxesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taxApi = inject(TaxService);
  private readonly citizenApi = inject(CitizenService);
  private readonly adminSession = inject(AdminSessionService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly statusChips: { value: CitizenTaxStatus | null; labelKey: string }[] = [
    { value: null, labelKey: 'ADMIN_CITIZEN_TAXES.FILTER_ALL' },
    ...CITIZEN_TAX_STATUSES.map((s) => ({ value: s, labelKey: taxStatusLabelKey(s) }))
  ];
  readonly paymentModes = TAX_PAYMENT_MODES;
  readonly taxStatusLabelKey = taxStatusLabelKey;
  readonly citizenTaxDisplayName = citizenTaxDisplayName;

  adminDisplayName: string | null = null;
  loading = false;
  rows: CitizenTaxDto[] = [];
  taxTypes: TaxTypeDto[] = [];
  searchQuery = '';
  statusFilter: CitizenTaxStatus | null = null;
  financialYearFilter = currentFinancialYear();

  assignOpen = false;
  assignSubmitting = false;
  selectedCitizens: SelectedCitizen[] = [];
  quickAddMobile = '';

  readonly assignForm = this.fb.nonNullable.group({
    taxTypeId: ['', Validators.required],
    financialYear: [currentFinancialYear(), Validators.required],
    amountAssessed: [null as number | null, [Validators.required, Validators.min(0.01)]],
    dueDate: [this.defaultDueDate(), Validators.required],
    assessmentNumber: [''],
    remarks: ['']
  });

  waiveOpen = false;
  waiveSubmitting = false;
  waiveTarget: CitizenTaxDto | null = null;
  waiveRemarks = '';

  paymentOpen = false;
  paymentSubmitting = false;
  paymentTarget: CitizenTaxDto | null = null;
  readonly paymentForm = this.fb.nonNullable.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    paidOn: [this.todayIso(), Validators.required],
    paymentMode: ['CASH' as const, Validators.required],
    reference: ['']
  });

  paymentsOpen = false;
  paymentsLoading = false;
  paymentsTarget: CitizenTaxDto | null = null;
  payments: TaxPaymentDto[] = [];

  ngOnInit(): void {
    const admin = this.adminSession.get();
    if (!admin) {
      void this.router.navigate(['/login']);
      return;
    }
    const role = admin.storedRole;
    if (role !== 'GRAMSEVAK' && role !== 'OPERATOR' && role !== 'SYS_ADMIN') {
      void this.router.navigate(['/admin/home']);
      return;
    }
    this.adminDisplayName = `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim() || null;
    void this.bootstrap();
  }

  get selectedCitizenCount(): number {
    return this.selectedCitizens.length;
  }

  get filteredRows(): CitizenTaxDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      return this.rows;
    }
    return this.rows.filter((r) => {
      const hay = [
        citizenTaxDisplayName(r),
        r.citizenMobile,
        r.taxTypeNameEn,
        r.taxTypeNameMr,
        r.financialYear,
        r.assessmentNumber,
        r.status
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }

  taxTypeLabel(row: CitizenTaxDto): string {
    const lang = this.i18n.currentLang === 'mr' ? 'mr' : 'en';
    return taxTypeDisplayName(row, lang);
  }

  statusBadgeClass(status: CitizenTaxStatus): string {
    const base = 'admin-tax-page__badge';
    switch (status) {
      case 'PENDING':
        return `${base} admin-tax-page__badge--pending`;
      case 'PARTIAL':
        return `${base} admin-tax-page__badge--partial`;
      case 'PAID':
        return `${base} admin-tax-page__badge--paid`;
      case 'WAIVED':
        return `${base} admin-tax-page__badge--waived`;
      default:
        return `${base} admin-tax-page__badge--off`;
    }
  }

  canWaive(row: CitizenTaxDto): boolean {
    return row.status === 'PENDING' || row.status === 'PARTIAL';
  }

  canRecordPayment(row: CitizenTaxDto): boolean {
    return row.status === 'PENDING' || row.status === 'PARTIAL';
  }

  logout(): void {
    this.adminSession.clear();
    void this.router.navigate(['/login']);
  }

  openAdminHome(): void {
    void this.router.navigate(['/admin/home']);
  }

  setStatusFilter(value: CitizenTaxStatus | null): void {
    this.statusFilter = value;
    void this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    try {
      this.rows = await firstValueFrom(
        this.taxApi.listCitizenTaxes({
          status: this.statusFilter ?? undefined,
          financialYear: this.financialYearFilter
        })
      );
    } catch {
      this.toast.show(this.i18n.translate('ADMIN_CITIZEN_TAXES.ERR_LOAD'), 'error');
      this.rows = [];
    } finally {
      this.loading = false;
    }
  }

  openAssign(): void {
    this.selectedCitizens = [];
    this.quickAddMobile = '';
    this.assignForm.reset({
      taxTypeId: this.taxTypes[0]?.id ?? '',
      financialYear: currentFinancialYear(),
      amountAssessed: null,
      dueDate: this.defaultDueDate(),
      assessmentNumber: '',
      remarks: ''
    });
    this.assignOpen = true;
  }

  closeAssign(): void {
    this.assignOpen = false;
  }

  removeSelectedCitizen(id: string): void {
    this.selectedCitizens = this.selectedCitizens.filter((c) => c.id !== id);
  }

  clearCitizenSelection(): void {
    this.selectedCitizens = [];
  }

  async addCitizenByMobile(): Promise<void> {
    const mobile = this.quickAddMobile.trim();
    if (!mobile) {
      return;
    }
    try {
      const citizen = await firstValueFrom(this.citizenApi.getByMobile(mobile));
      if (!citizen?.id) {
        this.toast.show(this.i18n.translate('ADMIN_CITIZEN_TAXES.ERR_CITIZEN'), 'error');
        return;
      }
      if (this.selectedCitizens.some((c) => c.id === citizen.id)) {
        this.toast.show(this.i18n.translate('ADMIN_CITIZEN_TAXES.CITIZEN_ALREADY_ADDED'), 'error');
        return;
      }
      this.selectedCitizens = [...this.selectedCitizens, AdminCitizenTaxesComponent.toSelectedCitizen(citizen)];
      this.quickAddMobile = '';
    } catch {
      this.toast.show(this.i18n.translate('ADMIN_CITIZEN_TAXES.ERR_CITIZEN'), 'error');
    }
  }

  async submitAssign(): Promise<void> {
    if (this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      return;
    }
    if (this.selectedCitizens.length === 0) {
      this.toast.show(this.i18n.translate('ADMIN_CITIZEN_TAXES.ERR_NO_CITIZENS'), 'error');
      return;
    }
    const admin = this.adminSession.get();
    if (!admin) {
      return;
    }
    const v = this.assignForm.getRawValue();
    this.assignSubmitting = true;
    try {
      const result = await firstValueFrom(
        this.taxApi.bulkCreateCitizenTaxes({
          staffUserId: admin.id,
          citizenIds: this.selectedCitizens.map((c) => c.id),
          taxTypeId: v.taxTypeId,
          financialYear: v.financialYear.trim(),
          amountAssessed: Number(v.amountAssessed),
          dueDate: v.dueDate,
          assessmentNumber: v.assessmentNumber?.trim() || null,
          remarks: v.remarks?.trim() || null
        })
      );
      if (result.failedCount > 0) {
        this.toast.show(
          this.i18n.translate('ADMIN_CITIZEN_TAXES.ASSIGNED_PARTIAL', {
            created: result.createdCount,
            failed: result.failedCount
          }),
          result.createdCount > 0 ? 'success' : 'error'
        );
      } else {
        this.toast.show(
          this.i18n.translate('ADMIN_CITIZEN_TAXES.ASSIGNED_MULTI', { count: result.createdCount }),
          'success'
        );
      }
      this.closeAssign();
      await this.load();
    } catch {
      this.toast.show(this.i18n.translate('ADMIN_CITIZEN_TAXES.ERR_ASSIGN'), 'error');
    } finally {
      this.assignSubmitting = false;
    }
  }

  openWaive(row: CitizenTaxDto): void {
    this.waiveTarget = row;
    this.waiveRemarks = '';
    this.waiveOpen = true;
  }

  closeWaive(): void {
    this.waiveOpen = false;
    this.waiveTarget = null;
  }

  async submitWaive(): Promise<void> {
    const admin = this.adminSession.get();
    if (!admin || !this.waiveTarget) {
      return;
    }
    this.waiveSubmitting = true;
    try {
      await firstValueFrom(
        this.taxApi.waiveCitizenTax(this.waiveTarget.id, {
          staffUserId: admin.id,
          remarks: this.waiveRemarks.trim() || null
        })
      );
      this.toast.show(this.i18n.translate('ADMIN_CITIZEN_TAXES.WAIVED'), 'success');
      this.closeWaive();
      await this.load();
    } catch {
      this.toast.show(this.i18n.translate('ADMIN_CITIZEN_TAXES.ERR_WAIVE'), 'error');
    } finally {
      this.waiveSubmitting = false;
    }
  }

  openPayment(row: CitizenTaxDto): void {
    this.paymentTarget = row;
    this.paymentForm.reset({
      amount: Number(row.amountOutstanding),
      paidOn: this.todayIso(),
      paymentMode: 'CASH',
      reference: ''
    });
    this.paymentOpen = true;
  }

  closePayment(): void {
    this.paymentOpen = false;
    this.paymentTarget = null;
  }

  async submitPayment(): Promise<void> {
    if (this.paymentForm.invalid || !this.paymentTarget) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    const admin = this.adminSession.get();
    if (!admin) {
      return;
    }
    const v = this.paymentForm.getRawValue();
    this.paymentSubmitting = true;
    try {
      await firstValueFrom(
        this.taxApi.recordPayment(this.paymentTarget.id, {
          staffUserId: admin.id,
          amount: Number(v.amount),
          paidOn: v.paidOn,
          paymentMode: v.paymentMode,
          reference: v.reference?.trim() || null
        })
      );
      this.toast.show(this.i18n.translate('ADMIN_CITIZEN_TAXES.PAYMENT_RECORDED'), 'success');
      this.closePayment();
      await this.load();
    } catch {
      this.toast.show(this.i18n.translate('ADMIN_CITIZEN_TAXES.ERR_PAYMENT'), 'error');
    } finally {
      this.paymentSubmitting = false;
    }
  }

  async openPayments(row: CitizenTaxDto): Promise<void> {
    this.paymentsTarget = row;
    this.paymentsOpen = true;
    this.paymentsLoading = true;
    this.payments = [];
    try {
      this.payments = await firstValueFrom(this.taxApi.listPayments(row.id));
    } catch {
      this.toast.show(this.i18n.translate('ADMIN_CITIZEN_TAXES.ERR_PAYMENTS'), 'error');
    } finally {
      this.paymentsLoading = false;
    }
  }

  closePayments(): void {
    this.paymentsOpen = false;
    this.paymentsTarget = null;
    this.payments = [];
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(
      value
    );
  }

  private static toSelectedCitizen(citizen: Citizen): SelectedCitizen {
    const name = `${citizen.firstName ?? ''} ${citizen.lastName ?? ''}`.trim();
    const label = name
      ? citizen.mobile
        ? `${name} (${citizen.mobile})`
        : name
      : citizen.mobile?.trim() || citizen.id;
    return { id: citizen.id, label };
  }

  private async bootstrap(): Promise<void> {
    try {
      this.taxTypes = await firstValueFrom(this.taxApi.listTaxTypes(true));
    } catch {
      this.taxTypes = [];
    }
    await this.load();
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private defaultDueDate(): string {
    const y = new Date().getFullYear();
    return `${y}-03-31`;
  }
}
