import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HeroBannerComponent } from '../shared/components/hero-banner/hero-banner.component';
import { ContactBannerComponent, ContactBannerConfig } from '../shared/components/contact-banner/contact-banner.component';
import { FooterBrandComponent, FooterBrandConfig } from '../shared/components/footer-brand/footer-brand.component';
import { ICONS, ICON_GROUPS } from '../shared';
import { I18nService } from '../i18n/i18n.service';
import { LanguageSwitcherComponent } from '../shared/components/language-switcher/language-switcher.component';
import { TenantService } from '../core/tenant.service';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    HeroBannerComponent,
    ContactBannerComponent,
    FooterBrandComponent,
    LanguageSwitcherComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginInput: string = '';
  showPassword: boolean = false;

  readonly icons = ICONS;
  readonly iconGroups = ICON_GROUPS;

  contactBannerConfig: ContactBannerConfig = {
    contactNumber: '9876543210',
    contactLabel: 'CONTACT.HELPLINE'
  };

  footerBrandConfig: FooterBrandConfig = {
    brandName: 'Smart Grampanchayat',
    developerName: 'Amey Infotech',
    year: 2026
  };

  private langSub: Subscription | undefined;

  constructor(
    public readonly i18n: I18nService,
    private readonly router: Router,
    private readonly tenantService: TenantService,
    private readonly translate: TranslateService,
    private readonly toast: ToastService
  ) {}

  ngOnInit() {
    this.applyTenantToUi();
    this.langSub = this.translate.onLangChange.subscribe(() => this.applyTenantToUi());
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }

  private applyTenantToUi(): void {
    const t = this.tenantService.tenant;
    if (!t) {
      return;
    }
    const phone = t.contactPhone?.trim();
    if (phone) {
      this.contactBannerConfig = { ...this.contactBannerConfig, contactNumber: phone };
    }
  }

  doLogin() {
    if (!this.loginInput.trim()) {
      this.toast.show(this.i18n.translate('LOGIN.ERROR_EMPTY'), 'error');
      return;
    }

    if (this.loginInput === 'SMART@123' || this.loginInput === 'admin') {
      this.toast.show(`${this.icons.SUCCESS} ${this.i18n.translate('LOGIN.SUCCESS_ADMIN')}`, 'success');
      void this.router.navigate(['/home']);
    } else if (/^\d{10}$/.test(this.loginInput)) {
      this.toast.show(`${this.icons.SUCCESS} ${this.i18n.translate('LOGIN.SUCCESS_CITIZEN')}`, 'success');
      void this.router.navigate(['/home']);
    } else {
      this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('LOGIN.ERROR_INVALID')}`, 'error');
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onEnterKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.doLogin();
    }
  }
}
