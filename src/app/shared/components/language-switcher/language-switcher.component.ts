import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService, SupportedLang } from '../../../i18n/i18n.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss']
})
export class LanguageSwitcherComponent {
  isOpen = false;

  constructor(
    public readonly i18n: I18nService,
    private readonly el: ElementRef<HTMLElement>
  ) {}

  get currentAbbr(): string {
    return this.i18n.currentLang === 'mr' ? 'MR' : 'EN';
  }

  choose(lang: SupportedLang) {
    this.i18n.use(lang);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as Node | null;
    if (!target) return;

    const root = this.el.nativeElement;
    if (!root.contains(target)) {
      this.isOpen = false;
      return;
    }

    const trigger = root.querySelector('.language-switcher-trigger');
    if (trigger?.contains(target)) {
      this.isOpen = !this.isOpen;
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.isOpen = false;
  }
}
