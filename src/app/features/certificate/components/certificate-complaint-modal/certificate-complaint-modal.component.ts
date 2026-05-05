import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { LoggedInCitizenService } from '../../../../core/logged-in-citizen.service';
import { CertificateTypeDto } from '../../../../core/certificate-type.models';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CERTIFICATE_COMPLAINT_SUBJECT_KEYS } from '../../data/certificate-form-options.data';
import { certificateTypeFileFieldKeys } from '../../lib/certificate-api-mapper';
import { validateCertificateComplaint } from '../../lib/certificate-form-validation';

@Component({
  selector: 'app-certificate-complaint-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './certificate-complaint-modal.component.html',
  styleUrls: ['../../styles/certificate-modal.shared.scss']
})
export class CertificateComplaintModalComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) sourceRow!: CertificateTypeDto;

  @Output() cancelled = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  private readonly loggedInCitizen = inject(LoggedInCitizenService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly complaintSubjectKeys = CERTIFICATE_COMPLAINT_SUBJECT_KEYS;

  /** FILE-type dynamic fields on this certificate type — drives optional evidence upload UI. */
  get complaintFileSlots(): string[] {
    return certificateTypeFileFieldKeys(this.sourceRow);
  }

  complaintForm = {
    name: '',
    phone: '',
    subject: '',
    location: '',
    details: ''
  };

  complaintFieldErrors: Partial<
    Record<'name' | 'phone' | 'subject' | 'details', string | undefined>
  > = {};

  complaintEvidenceFile: File | null = null;

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
    const f = this.complaintForm;
    if (f.name?.trim()) {
      return;
    }
    const n = this.loggedInCitizen.getBadgeDisplayName()?.trim();
    if (n) {
      f.name = n;
      this.cdr.markForCheck();
    }
  }

  onPanelClick(ev: MouseEvent): void {
    ev.stopPropagation();
  }

  onComplaintFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    this.complaintEvidenceFile = input.files?.[0] ?? null;
  }

  close(): void {
    this.cancelled.emit();
  }

  submit(): void {
    const { ok, errors } = validateCertificateComplaint(this.complaintForm);
    this.complaintFieldErrors = ok ? {} : errors;
    if (!ok) {
      return;
    }
    this.submitted.emit();
  }
}
