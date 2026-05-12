import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { LoggedInCitizenService } from '../../../../core/logged-in-citizen.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CERTIFICATE_SUGGESTIONS_CATEGORY_KEYS } from '../../data/certificate-form-options.data';
import { validateCertificateSuggestions } from '../../lib/certificate-form-validation';

@Component({
  selector: 'app-certificate-suggestions-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './certificate-suggestions-modal.component.html',
  styleUrls: ['../../styles/certificate-modal.shared.scss']
})
export class CertificateSuggestionsModalComponent implements OnInit, AfterViewInit {
  @Output() cancelled = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  private readonly loggedInCitizen = inject(LoggedInCitizenService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);

  readonly suggestionsForm = this.fb.nonNullable.group({
    name: [''],
    phone: [''],
    category: [''],
    details: [''],
    benefit: ['']
  });

  readonly suggestionsCategoryKeys = CERTIFICATE_SUGGESTIONS_CATEGORY_KEYS;

  suggestionsFieldErrors: Partial<
    Record<'name' | 'phone' | 'category' | 'details', string | undefined>
  > = {};

  @ViewChild('panel', { read: ElementRef })
  panelRef?: ElementRef<HTMLElement>;
  @ViewChild('closeBtn', { read: ElementRef })
  closeBtnRef?: ElementRef<HTMLButtonElement>;

  ngOnInit(): void {
    this.prefillNameFromBadge();
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.prefillNameFromBadge());
  }

  onBackdropClick(): void {
    this.cancelled.emit();
  }

  private prefillNameFromBadge(): void {
    if (this.suggestionsForm.controls.name.value.trim()) {
      return;
    }
    const n = this.loggedInCitizen.getBadgeDisplayName()?.trim();
    if (n) {
      this.suggestionsForm.controls.name.setValue(n);
      this.cdr.markForCheck();
    }
  }

  onPanelClick(ev: MouseEvent): void {
    ev.stopPropagation();
  }

  close(): void {
    this.cancelled.emit();
  }

  submit(): void {
    const { ok, errors } = validateCertificateSuggestions(this.suggestionsForm.getRawValue());
    this.suggestionsFieldErrors = ok ? {} : errors;
    if (!ok) {
      return;
    }
    this.submitted.emit();
  }
}
