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
import { prefillApplicantNameField } from '../../../../core/citizen-applicant-prefill';
import { CitizenService } from '../../../../core/citizen.service';
import { LoggedInCitizenService } from '../../../../core/logged-in-citizen.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CERTIFICATE_SUGGESTIONS_CATEGORY_KEYS } from '../../data/certificate-form-options.data';
import { validateCertificateSuggestions } from '../../lib/certificate-form-validation';

@Component({
  selector: 'app-certificate-suggestions-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './certificate-suggestions-modal.component.html',
  styleUrls: ['../../styles/certificate-modal.shared.scss']
})
export class CertificateSuggestionsModalComponent implements OnInit, AfterViewInit {
  @Output() cancelled = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  private readonly loggedInCitizen = inject(LoggedInCitizenService);
  private readonly citizenService = inject(CitizenService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly suggestionsCategoryKeys = CERTIFICATE_SUGGESTIONS_CATEGORY_KEYS;

  suggestionsForm = {
    name: '',
    phone: '',
    category: '',
    details: '',
    benefit: ''
  };

  suggestionsFieldErrors: Partial<
    Record<'name' | 'phone' | 'category' | 'details', string | undefined>
  > = {};

  @ViewChild('panel', { read: ElementRef })
  panelRef?: ElementRef<HTMLElement>;
  @ViewChild('closeBtn', { read: ElementRef })
  closeBtnRef?: ElementRef<HTMLButtonElement>;

  ngOnInit(): void {
    prefillApplicantNameField(this.loggedInCitizen, this.citizenService, this.suggestionsForm, this.cdr);
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      if (!this.suggestionsForm.name?.trim()) {
        prefillApplicantNameField(this.loggedInCitizen, this.citizenService, this.suggestionsForm, this.cdr);
      }
    });
  }

  onBackdropClick(): void {
    this.cancelled.emit();
  }

  onPanelClick(ev: MouseEvent): void {
    ev.stopPropagation();
  }

  close(): void {
    this.cancelled.emit();
  }

  submit(): void {
    const { ok, errors } = validateCertificateSuggestions(this.suggestionsForm);
    this.suggestionsFieldErrors = ok ? {} : errors;
    if (!ok) {
      return;
    }
    this.submitted.emit();
  }
}
