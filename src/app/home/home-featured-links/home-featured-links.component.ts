import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import type { HomeQuickLink } from '../models/home.models';
import { homeQuickLinkRoute, isHomeStubLink } from '../utils/home-link.utils';

@Component({
  selector: 'app-home-featured-links',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './home-featured-links.component.html',
  styleUrls: ['./home-featured-links.component.scss']
})
export class HomeFeaturedLinksComponent {
  @Input({ required: true }) links: HomeQuickLink[] = [];

  readonly linkRoute = homeQuickLinkRoute;
  readonly isStubLink = isHomeStubLink;
}
