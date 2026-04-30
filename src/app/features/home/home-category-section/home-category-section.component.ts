import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import type { HomeLinkCategory } from '../models/home.models';
import { homeQuickLinkRoute, isHomeStubLink } from '../utils/home-link.utils';

@Component({
  selector: 'app-home-category-section',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './home-category-section.component.html',
  styleUrls: ['./home-category-section.component.scss']
})
export class HomeCategorySectionComponent {
  /** When true, tightens top margin (replaces .home-services + .home-cat) */
  @Input() isFirst = false;
  @Input() sectionIndex = 0;
  @Input({ required: true }) category!: HomeLinkCategory;

  readonly linkRoute = homeQuickLinkRoute;
  readonly isStubLink = isHomeStubLink;
}
