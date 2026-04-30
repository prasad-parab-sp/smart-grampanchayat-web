import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { STUB_SLUG_TO_TITLE } from './shell.stub-titles';

/** Placeholder for shell tabs; also used for `stub/:slug` from the home quick links. */
@Component({
  selector: 'app-shell-placeholder',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <section class="sec-placeholder card">
      <h2 class="sec-title">{{ titleKey | translate }}</h2>
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
export class ShellPlaceholderComponent implements OnInit {
  titleKey = 'HOME.SECTION_PLACEHOLDER_TITLE';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      return;
    }
    const mapped = STUB_SLUG_TO_TITLE[slug];
    if (mapped) {
      this.titleKey = mapped;
    } else {
      void this.router.navigate(['/home']);
    }
  }
}
