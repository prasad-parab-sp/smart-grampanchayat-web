import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/** Temporary page for shell tabs until feature modules are added. */
@Component({
  selector: 'app-shell-placeholder',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <section class="sec-placeholder card">
      <h2 class="sec-title">{{ 'HOME.SECTION_PLACEHOLDER_TITLE' | translate }}</h2>
      <p class="sec-placeholder__text">{{ 'HOME.SECTION_PLACEHOLDER_BODY' | translate }}</p>
    </section>
  `,
  styles: [
    `
      .sec-placeholder__text {
        font-size: 13px;
        color: var(--sub);
        line-height: 1.6;
      }
    `
  ]
})
export class ShellPlaceholderComponent {}
