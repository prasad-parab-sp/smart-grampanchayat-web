import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { FooterBrandComponent, FooterBrandConfig } from '../../shared/components/footer-brand/footer-brand.component';
import { TenantSessionStore } from '../../core/tenant-session.store';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';
import { ICONS } from '../../shared';
import { AdminSessionService } from '../../core/admin-session.service';
import { LoggedInCitizenService } from '../../core/logged-in-citizen.service';
import { MasterAdminAuthService } from '../../core/master-admin-auth.service';
import { MasterAdminSessionService } from '../../core/master-admin-session.service';
import { ToastService } from '../../core/toast.service';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'app-platform-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterLink,
    FooterBrandComponent,
    LanguageSwitcherComponent
  ],
  templateUrl: './platform-admin-login.component.html',
  styleUrls: ['./platform-admin-login.component.scss']
})
export class PlatformAdminLoginComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(MasterAdminAuthService);
  private readonly session = inject(MasterAdminSessionService);
  private readonly gpAdminSession = inject(AdminSessionService);
  private readonly citizenSession = inject(LoggedInCitizenService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  private readonly translate = inject(TranslateService);
  private readonly tenantSession = inject(TenantSessionStore);

  readonly icons = ICONS;
  showPassword = false;
  pending = false;

  readonly form = this.fb.group({
    mobileNumber: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^\d{10}$/)]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)])
  });

  footerBrandConfig: FooterBrandConfig = {
    brandName: 'Smart GP Platform',
    developerName: 'Amey Infotech',
    year: 2026
  };

  private langSub?: Subscription;

  ngOnInit(): void {
    this.tenantSession.clear();
    this.langSub = this.translate.onLangChange.subscribe(() => {
      /* no-op: platform hero uses translate pipe */
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  async submit(): Promise<void> {
    if (this.pending) {
      return;
    }
    const mobile = this.form.controls.mobileNumber.value.trim();
    const password = this.form.controls.password.value;
    if (!mobile || !password) {
      this.toast.show(this.i18n.translate('PLATFORM_ADMIN.LOGIN.ERROR_REQUIRED'), 'error');
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      this.toast.show(this.i18n.translate('PLATFORM_ADMIN.LOGIN.ERROR_INVALID_MOBILE'), 'error');
      return;
    }

    this.pending = true;
    try {
      const user = await firstValueFrom(this.auth.login(mobile, password));
      this.gpAdminSession.clear();
      this.citizenSession.clearSession();
      this.session.set(user);
      await this.router.navigate(['/admin/platform/home']);
      this.toast.showLoginWelcome(
        user.displayName,
        this.i18n.translate('PLATFORM_ADMIN.LOGIN.WELCOME_SUFFIX'),
        { truncatePrimary: 24 }
      );
    } catch (err) {
      const status = (err as HttpErrorResponse)?.status ?? 0;
      const key =
        status === 400
          ? 'PLATFORM_ADMIN.LOGIN.ERROR_INVALID_MOBILE'
          : status === 401
            ? 'PLATFORM_ADMIN.LOGIN.ERROR_INVALID'
            : 'PLATFORM_ADMIN.LOGIN.ERROR_SERVER';
      this.toast.show(`${this.icons.ERROR} ${this.i18n.translate(key)}`, 'error');
    } finally {
      this.pending = false;
    }
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      void this.submit();
    }
  }
}
