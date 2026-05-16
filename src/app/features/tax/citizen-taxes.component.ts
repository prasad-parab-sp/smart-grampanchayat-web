import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { LoggedInCitizenService } from '../../core/logged-in-citizen.service';
import { TaxService } from '../../core/tax.service';
import {
  CitizenTaxDto,
  isTaxOutstanding,
  taxStatusLabelKey,
  taxTypeDisplayName
} from '../../core/tax.models';
import { I18nService } from '../../i18n/i18n.service';
import { GramAppHeaderComponent } from '../../shared/components/gram-app-header/gram-app-header.component';

@Component({
  selector: 'app-citizen-taxes',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, GramAppHeaderComponent],
  templateUrl: './citizen-taxes.component.html',
  styleUrls: ['./citizen-taxes.component.scss']
})
export class CitizenTaxesComponent implements OnInit {
  private readonly taxApi = inject(TaxService);
  private readonly loggedInCitizen = inject(LoggedInCitizenService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly taxStatusLabelKey = taxStatusLabelKey;
  readonly isTaxOutstanding = isTaxOutstanding;

  loading = true;
  rows: CitizenTaxDto[] = [];
  pendingCount = 0;
  pendingTotal = 0;

  ngOnInit(): void {
    void this.load();
  }

  taxTypeLabel(row: CitizenTaxDto): string {
    const lang = this.i18n.currentLang === 'mr' ? 'mr' : 'en';
    return taxTypeDisplayName(row, lang);
  }

  statusBadgeClass(status: CitizenTaxDto['status']): string {
    const base = 'citizen-tax__badge';
    switch (status) {
      case 'PENDING':
        return `${base} citizen-tax__badge--pending`;
      case 'PARTIAL':
        return `${base} citizen-tax__badge--partial`;
      case 'PAID':
        return `${base} citizen-tax__badge--paid`;
      case 'WAIVED':
        return `${base} citizen-tax__badge--waived`;
      default:
        return base;
    }
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(
      value
    );
  }

  private async load(): Promise<void> {
    const citizenId = this.loggedInCitizen.getCurrentLoggedInCitizenId();
    if (!citizenId) {
      void this.router.navigate(['/login']);
      return;
    }
    this.loading = true;
    try {
      this.rows = await firstValueFrom(this.taxApi.listCitizenTaxesForCitizen(citizenId));
      const outstanding = this.rows.filter(isTaxOutstanding);
      this.pendingCount = outstanding.length;
      this.pendingTotal = outstanding.reduce((sum, r) => sum + Number(r.amountOutstanding), 0);
    } catch {
      this.rows = [];
      this.pendingCount = 0;
      this.pendingTotal = 0;
    } finally {
      this.loading = false;
    }
  }
}
