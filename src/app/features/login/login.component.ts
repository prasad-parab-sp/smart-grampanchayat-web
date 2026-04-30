import { Component, Injector, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';
import { HeroBannerComponent } from '../../shared/components/hero-banner/hero-banner.component';
import { ContactBannerComponent, ContactBannerConfig } from '../../shared/components/contact-banner/contact-banner.component';
import { FooterBrandComponent, FooterBrandConfig } from '../../shared/components/footer-brand/footer-brand.component';
import { ICONS, ICON_GROUPS } from '../../shared';
import { I18nService } from '../../i18n/i18n.service';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';
import { TenantService } from '../../core/tenant.service';
import { ToastService } from '../../core/toast.service';
import { CitizenService } from '../../core/citizen.service';
import { CitizenSessionStore } from '../../core/citizen-session.store';
import { citizenBadgeFirstLastName } from '../../core/citizen-name.util';

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
  /** Resolves {@link CitizenService} only when the user submits a 10-digit mobile (no citizen HTTP on route load). */
  private readonly injector = inject(Injector);

  loginInput: string = '';
  showPassword: boolean = false;
  loginPending = false;

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
    private readonly toast: ToastService,
    private readonly citizenSession: CitizenSessionStore
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

  async doLogin() {
    const raw = this.loginInput.trim();
    if (!raw) {
      this.toast.show(this.i18n.translate('LOGIN.ERROR_EMPTY'), 'error');
      return;
    }
    if (this.loginPending) {
      return;
    }

    if (raw === 'SMART@123' || raw === 'admin') {
      this.citizenSession.clearWelcome();
      void this.router.navigate(['/home']).then(() => {
        this.toast.showLoginWelcome(this.i18n.translate('LOGIN.SUCCESS_ADMIN'));
      });
      return;
    }

    if (/^\d{10}$/.test(raw)) {
      this.loginPending = true;
      try {
        const citizenService = this.injector.get(CitizenService);
        const citizen = await firstValueFrom(citizenService.getByMobile(raw));
        const badgeName = citizen ? citizenBadgeFirstLastName(citizen) : '';
        if (!citizen || !badgeName) {
          this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('LOGIN.ERROR_MOBILE_NOT_FOUND')}`, 'error');
          return;
        }
        this.citizenSession.setWelcomeDisplayName(badgeName);
        void this.router.navigate(['/home']).then(() => {
          this.toast.showLoginWelcome(
            badgeName,
            this.i18n.translate('LOGIN.WELCOME_SUFFIX'),
            { truncatePrimary: 20 }
          );
        });
      } catch {
        this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('LOGIN.ERROR_CITIZEN_LOOKUP')}`, 'error');
      } finally {
        this.loginPending = false;
      }
      return;
    }

    this.toast.show(`${this.icons.ERROR} ${this.i18n.translate('LOGIN.ERROR_INVALID')}`, 'error');
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
