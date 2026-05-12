import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';
import { HeroBannerComponent } from '../../shared/components/hero-banner/hero-banner.component';
import { ContactBannerComponent, ContactBannerConfig } from '../../shared/components/contact-banner/contact-banner.component';
import { FooterBrandComponent, FooterBrandConfig } from '../../shared/components/footer-brand/footer-brand.component';
import { ICONS } from '../../shared';
import { I18nService } from '../../i18n/i18n.service';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';
import { TenantService } from '../../core/tenant.service';
import { ToastService } from '../../core/toast.service';
import { CitizenService } from '../../core/citizen.service';
import { LoggedInCitizenService } from '../../core/logged-in-citizen.service';
import { citizenFullDisplayName } from '../../core/citizen-name.util';
import { AdminAuthService } from '../../core/admin-auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminSessionService } from '../../core/admin-session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
  loginMode: 'citizen' | 'admin' = 'citizen';

  private readonly fb = inject(FormBuilder);
  readonly loginForm = this.fb.group({
    mobileNumber: this.fb.nonNullable.control(''),
    adminIdentifier: this.fb.nonNullable.control(''),
    adminPassword: this.fb.nonNullable.control('')
  });

  showAdminPassword = false;
  citizenLoginPending = false;
  adminLoginPending = false;

  readonly icons = ICONS;

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
    private readonly toast: ToastService,
    private readonly loggedInCitizen: LoggedInCitizenService,
    private readonly citizenService: CitizenService,
    private readonly adminAuthService: AdminAuthService,
    private readonly adminSession: AdminSessionService
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

  setLoginMode(mode: 'citizen' | 'admin'): void {
    this.loginMode = mode;
  }

  async doLogin() {
    if (this.loginMode === 'admin') {
      await this.doAdminLogin();
      return;
    }
    await this.doCitizenLogin();
  }

  private async doCitizenLogin() {
    const raw = this.loginForm.controls.mobileNumber.value.trim();
    if (!raw) {
      this.toast.show(this.i18n.translate('LOGIN.ERROR_EMPTY'), 'error');
      return;
    }
    if (this.citizenLoginPending) {
      return;
    }

    if (/^\d{10}$/.test(raw)) {
      this.citizenLoginPending = true;
      try {
        const citizen = await firstValueFrom(this.citizenService.getByMobile(raw));
        const fullName = citizen ? citizenFullDisplayName(citizen) : '';
        if (!citizen?.id?.trim() || !fullName) {
          this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('LOGIN.ERROR_MOBILE_NOT_FOUND')}`, 'error');
          return;
        }
        this.adminSession.clear();
        this.loggedInCitizen.setLoggedInCitizen(citizen);
        void this.router.navigate(['/home']).then(() => {
          this.toast.showLoginWelcome(
            fullName,
            this.i18n.translate('LOGIN.WELCOME_SUFFIX'),
            { truncatePrimary: 20 }
          );
        });
      } catch {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('LOGIN.ERROR_CITIZEN_LOOKUP')}`, 'error');
      } finally {
        this.citizenLoginPending = false;
      }
      return;
    }

    this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('LOGIN.ERROR_INVALID')}`, 'error');
  }

  private async doAdminLogin(): Promise<void> {
    const identifier = this.loginForm.controls.adminIdentifier.value.trim();
    const password = this.loginForm.controls.adminPassword.value.trim();

    if (!identifier) {
      this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('LOGIN.ADMIN.ERROR_IDENTIFIER_REQUIRED')}`, 'error');
      return;
    }
    if (!password) {
      this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('LOGIN.ADMIN.ERROR_PASSWORD_REQUIRED')}`, 'error');
      return;
    }
    if (this.adminLoginPending) {
      return;
    }

    this.adminLoginPending = true;
    try {
      const res = await firstValueFrom(this.adminAuthService.login(identifier, password));
      const fullName = `${res.user.firstName ?? ''} ${res.user.lastName ?? ''}`.trim() || identifier;
      this.adminSession.set({
        id: res.user.id,
        role: res.user.effectiveRole ?? res.user.role,
        storedRole: res.user.role,
        firstName: res.user.firstName,
        lastName: res.user.lastName,
        loginIdentifier: identifier
      });
      void this.router.navigate(['/admin/home']).then(() => {
        this.toast.showLoginWelcome(
          fullName,
          this.i18n.translate('LOGIN.ADMIN.WELCOME_SUFFIX'),
          { truncatePrimary: 24 }
        );
      });
    } catch (err) {
      const status = (err as HttpErrorResponse | undefined)?.status ?? 0;
      if (status === 401) {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('LOGIN.ADMIN.ERROR_INVALID_CREDENTIALS')}`, 'error');
      } else if (status === 403) {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('LOGIN.ADMIN.ERROR_INACTIVE')}`, 'error');
      } else {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('LOGIN.ADMIN.ERROR_SERVER')}`, 'error');
      }
    } finally {
      this.adminLoginPending = false;
    }
  }

  onEnterKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      void this.doLogin();
    }
  }
}
