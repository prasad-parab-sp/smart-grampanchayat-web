import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HeroBannerComponent, HeroBannerConfig } from '../shared/components/hero-banner/hero-banner.component';
import { ContactBannerComponent, ContactBannerConfig } from '../shared/components/contact-banner/contact-banner.component';
import { FooterBrandComponent, FooterBrandConfig } from '../shared/components/footer-brand/footer-brand.component';
import { ICONS, ICON_GROUPS } from '../shared';
import { I18nService } from '../i18n/i18n.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TranslateModule,
    HeroBannerComponent, 
    ContactBannerComponent, 
    FooterBrandComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginInput: string = '';
  showPassword: boolean = false;
  
  // Icons from centralized icon system
  readonly icons = ICONS;
  readonly iconGroups = ICON_GROUPS;
  
  // Component configurations
  heroBannerConfig: HeroBannerConfig = {
    gpName: 'GP.NAME',
    gpLocation: 'GP.LOCATION',
    logoUrl: '/assets/images/logo.png',
    bannerUrl: ''
  };

  contactBannerConfig: ContactBannerConfig = {
    contactNumber: '9876543210',
    contactLabel: 'CONTACT.HELPLINE'
  };

  footerBrandConfig: FooterBrandConfig = {
    brandName: 'Smart Grampanchayat',
    developerName: 'Amey Infotech',
    year: 2025
  };

  ngOnInit() {
    // Component initialization
    // Future: Load GP configuration from service
  }

  constructor(public readonly i18n: I18nService) {}

  doLogin() {
    if (!this.loginInput.trim()) {
      this.showToast(this.i18n.translate('LOGIN.ERROR_EMPTY'), 'error');
      return;
    }

    // Simulate login logic (would be replaced with actual authentication)
    if (this.loginInput === 'SMART@123' || this.loginInput === 'admin') {
      this.showToast(`${this.icons.SUCCESS} ${this.i18n.translate('LOGIN.SUCCESS_ADMIN')}`, 'success');
      // Redirect to admin dashboard
      console.log('Admin login successful');
    } else if (/^\d{10}$/.test(this.loginInput)) {
      // Mobile number validation
      this.showToast(`${this.icons.SUCCESS} ${this.i18n.translate('LOGIN.SUCCESS_CITIZEN')}`, 'success');
      // Redirect to citizen dashboard
      console.log('Citizen login successful');
    } else {
      this.showToast(`${this.icons.ERROR} ${this.i18n.translate('LOGIN.ERROR_INVALID')}`, 'error');
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


  private showToast(message: string, type: 'success' | 'error') {
    // Simple toast implementation (would use a proper toast service in real app)
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#4CAF50' : '#f44336'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}