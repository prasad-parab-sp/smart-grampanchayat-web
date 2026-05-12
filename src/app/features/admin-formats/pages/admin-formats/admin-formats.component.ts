import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { AdminSessionService } from '../../../../core/admin-session.service';
import {
  CertificateDocumentFormatDto,
  CertificateDocumentFormatUpsertRequest,
  DocumentFormatKind
} from '../../../../core/certificate-document-format.models';
import { CertificateDocumentFormatService } from '../../../../core/certificate-document-format.service';
import {
  CertificateTypeCategory,
  CertificateTypeDto
} from '../../../../core/certificate-type.models';
import { CertificateTypeService } from '../../../../core/certificate-type.service';
import { TenantSessionStore } from '../../../../core/tenant-session.store';
import { ToastService } from '../../../../core/toast.service';
import { I18nService } from '../../../../i18n/i18n.service';
import { GramAppHeaderComponent } from '../../../../shared/components/gram-app-header/gram-app-header.component';
import {
  heroBannerConfigFromSession,
  heroBannerConfigFromTenant
} from '../../../../shared/components/hero-banner/hero-banner.mapper';
import {
  expandFormatPlaceholders,
  FormatPreviewContext,
  FormatPreviewSample,
  injectDocumentTitleBelowHeaderIfMissing
} from '../../admin-format-preview.utils';

type FormatType = 'dakhala' | 'bill' | 'receipt' | 'notice' | 'other';

interface AdminFormatTemplate {
  id: string;
  name: string;
  type: FormatType;
  /** Links to {@link CertificateTypeDto.code} when set; compose-only when null/empty. */
  certificateTypeCode: string | null;
  documentTitle: string;
  bodyHtml: string;
  footerNote: string;
  /** Internal notes (API: internalNote, DB: internal_note). */
  internalNote: string;
  active: boolean;
  updatedAt: string;
}

const ADMIN_FORMATS_STORAGE_KEY = 'smart-gp.admin-formats-v2';

@Component({
  selector: 'app-admin-formats',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, GramAppHeaderComponent],
  templateUrl: './admin-formats.component.html',
  styleUrls: ['./admin-formats.component.scss']
})
export class AdminFormatsComponent implements OnInit {
  /** Literal tokens for toolbar labels (avoid `{` in templates). */
  readonly tokHeader = '{$header}';
  readonly tokFooter = '{$footer}';
  /** Same printable blocks as bracket-style placeholders (consistent with [नाव], etc.). */
  readonly tokHeaderBracket = '[$header]';
  readonly tokFooterBracket = '[$footer]';
  readonly tokTitle = '{$title}';
  readonly tokTitleBracket = '[$title]';

  private readonly adminSession = inject(AdminSessionService);
  private readonly router = inject(Router);
  private readonly tenantSession = inject(TenantSessionStore);
  private readonly certificateTypesApi = inject(CertificateTypeService);
  private readonly certificateFormatsApi = inject(CertificateDocumentFormatService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly fb = inject(FormBuilder);

  readonly filterForm = this.fb.nonNullable.group({
    searchTerm: ['']
  });

  readonly editorForm = this.fb.nonNullable.group({
    name: [''],
    documentTitle: [''],
    certificateCode: [''],
    formatType: this.fb.nonNullable.control<FormatType>('dakhala'),
    footerNote: [''],
    internalNote: [''],
    active: this.fb.nonNullable.control(true)
  });

  @ViewChild('bodyEditor') bodyEditor?: ElementRef<HTMLDivElement>;

  adminDisplayName: string | null = null;
  adminRoleLabel: string | null = null;

  certificateTypes: CertificateTypeDto[] = [];

  templates: AdminFormatTemplate[] = [];
  activeType: 'all' | FormatType = 'all';

  editorOpen = false;
  editingId: string | null = null;

  /** Rich body HTML (contenteditable; not part of reactive form). */
  draftBodyHtml = '';

  previewOpen = false;
  previewSafe: SafeHtml | null = null;

  ngOnInit(): void {
    const admin = this.adminSession.get();
    if (!admin) {
      void this.router.navigate(['/login']);
      return;
    }
    this.adminDisplayName = `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim() || null;
    this.adminRoleLabel = admin.role?.trim().replaceAll('_', ' ') || null;

    void this.bootstrapFormats();
  }

  private async bootstrapFormats(): Promise<void> {
    await this.loadCertificateCatalog();
    try {
      const rows = await firstValueFrom(this.certificateFormatsApi.list());
      this.templates = rows.map((formatDto) => this.dtoToTemplate(formatDto));
    } catch {
      this.toast.show(this.i18n.translate('ADMIN_FORMATS.ERR_API'), 'error');
      this.templates = this.loadTemplatesLocal();
    }
  }

  private async loadCertificateCatalog(): Promise<void> {
    try {
      this.certificateTypes = await firstValueFrom(
        this.certificateTypesApi.list(CertificateTypeCategory.CERTIFICATE)
      );
    } catch {
      this.certificateTypes = [];
    }
  }

  logout(): void {
    this.adminSession.clear();
    void this.router.navigate(['/login']);
  }

  certificateLabel(certificateType: CertificateTypeDto): string {
    const en = this.i18n.currentLang === 'en';
    const primary = (en ? certificateType.nameEn : certificateType.nameMr)?.trim();
    return primary || certificateType.nameMr || certificateType.code;
  }

  openAddEditor(): void {
    this.editorOpen = true;
    this.editingId = null;
    this.editorForm.reset({
      name: '',
      documentTitle: '',
      certificateCode: '',
      formatType: 'dakhala',
      footerNote: '',
      internalNote: '',
      active: true
    });
    this.draftBodyHtml = this.defaultBodyTemplate();
    setTimeout(() => this.syncEditorDomFromDraft(), 0);
  }

  startEdit(item: AdminFormatTemplate): void {
    this.editorOpen = true;
    this.editingId = item.id;
    this.editorForm.patchValue({
      name: item.name,
      documentTitle: item.documentTitle,
      certificateCode: item.certificateTypeCode ?? '',
      formatType: item.type,
      footerNote: item.footerNote,
      internalNote: item.internalNote,
      active: item.active
    });
    this.draftBodyHtml = item.bodyHtml || '';
    setTimeout(() => this.syncEditorDomFromDraft(), 0);
  }

  cancelEditor(): void {
    this.editorOpen = false;
  }

  private defaultBodyTemplate(): string {
    return [
      '<p>{$header}</p>',
      '{$title}',
      '<p>&nbsp;</p>',
      '<p>प्रमाणित केले जाते की [नाव] हे या ग्रामपंचायतीचे कायमचे रहिवासी आहेत.</p>',
      '<p>&nbsp;</p>',
      '<p>हा दाखला [कशासाठी] साठी देण्यात येत आहे.</p>',
      '<p>&nbsp;</p>',
      '<p>{$footer}</p>'
    ].join('');
  }

  private syncEditorDomFromDraft(): void {
    const el = this.bodyEditor?.nativeElement;
    if (el) {
      el.innerHTML = this.draftBodyHtml || '';
    }
  }

  onBodyInput(): void {
    const el = this.bodyEditor?.nativeElement;
    this.draftBodyHtml = el?.innerHTML ?? '';
  }

  runRichTextCommand(cmd: 'bold' | 'underline' | 'insertOrderedList' | 'insertUnorderedList'): void {
    const el = this.bodyEditor?.nativeElement;
    el?.focus();
    document.execCommand(cmd, false);
    this.onBodyInput();
  }

  insertBodyPlaceholderToken(tag: string): void {
    const el = this.bodyEditor?.nativeElement;
    el?.focus();
    document.execCommand('insertHTML', false, tag);
    this.onBodyInput();
  }

  insertBodyTableTemplate(): void {
    const table = `<table class="fmt-inner-table" border="1" cellpadding="6" style="width:100%;border-collapse:collapse;font-size:13px;"><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>`;
    this.insertBodyPlaceholderToken(table);
  }

  async saveTemplate(): Promise<void> {
    const { name, certificateCode, documentTitle, footerNote, internalNote, formatType, active } =
      this.editorForm.getRawValue();
    const cleanName = name.trim();
    if (!cleanName) {
      this.toast.show(this.i18n.translate('ADMIN_FORMATS.ERR_NAME'), 'error');
      return;
    }

    if (this.certificateTypes.length > 0 && !certificateCode.trim()) {
      this.toast.show(this.i18n.translate('ADMIN_FORMATS.ERR_CERT_REQUIRED'), 'error');
      return;
    }

    const cleanBody = (this.bodyEditor?.nativeElement?.innerHTML ?? this.draftBodyHtml).trim();
    if (!cleanBody) {
      this.toast.show(this.i18n.translate('ADMIN_FORMATS.ERR_BODY'), 'error');
      return;
    }

    const code = certificateCode.trim() ? certificateCode.trim() : null;

    if (code) {
      const exists = this.certificateTypes.some((certificateType) => certificateType.code === code);
      if (!exists) {
        this.toast.show(this.i18n.translate('ADMIN_FORMATS.ERR_CERT_INVALID'), 'error');
        return;
      }
    }

    const upsert = this.upsertFromDraft(
      cleanBody,
      code,
      { name: cleanName, documentTitle, footerNote, internalNote, formatType, active }
    );
    try {
      if (this.editingId) {
        const saved = await firstValueFrom(
          this.certificateFormatsApi.update(this.editingId, upsert)
        );
        const mapped = this.dtoToTemplate(saved);
        this.templates = this.templates.map((item) =>
          item.id === mapped.id ? mapped : item
        );
      } else {
        const saved = await firstValueFrom(this.certificateFormatsApi.create(upsert));
        this.templates = [this.dtoToTemplate(saved), ...this.templates];
      }
      this.editorOpen = false;
      this.toast.show(this.i18n.translate('ADMIN_FORMATS.SAVED'), 'success');
    } catch {
      this.toast.show(this.i18n.translate('ADMIN_FORMATS.ERR_API'), 'error');
    }
  }

  async toggleActive(item: AdminFormatTemplate): Promise<void> {
    const upsert = this.upsertFromTemplate({ ...item, active: !item.active });
    try {
      const saved = await firstValueFrom(this.certificateFormatsApi.update(item.id, upsert));
      const mapped = this.dtoToTemplate(saved);
      this.templates = this.templates.map((row) => (row.id === mapped.id ? mapped : row));
    } catch {
      this.toast.show(this.i18n.translate('ADMIN_FORMATS.ERR_API'), 'error');
    }
  }

  async remove(item: AdminFormatTemplate): Promise<void> {
    try {
      await firstValueFrom(this.certificateFormatsApi.delete(item.id));
      this.templates = this.templates.filter((row) => row.id !== item.id);
    } catch {
      this.toast.show(this.i18n.translate('ADMIN_FORMATS.ERR_API'), 'error');
    }
  }

  openPreview(item?: AdminFormatTemplate): void {
    const body = item
      ? item.bodyHtml
      : (this.bodyEditor?.nativeElement?.innerHTML ?? this.draftBodyHtml);
    const footerExtra = item ? item.footerNote : this.editorForm.controls.footerNote.value;
    const documentTitle = item ? item.documentTitle : this.editorForm.controls.documentTitle.value;
    const ctx = this.buildPreviewContext(documentTitle);
    let html = expandFormatPlaceholders(body, ctx);
    html = injectDocumentTitleBelowHeaderIfMissing(html, documentTitle);
    if (footerExtra.trim()) {
      html += `<p class="fmt-footer-note">${this.escapeForEmbed(footerExtra)}</p>`;
    }
    const wrapped = `<div class="fmt-preview-print">${html}</div>`;
    this.previewSafe = this.sanitizer.bypassSecurityTrustHtml(wrapped);
    this.previewOpen = true;
  }

  closePreview(): void {
    this.previewOpen = false;
    this.previewSafe = null;
  }

  printPreview(): void {
    window.print();
  }

  private escapeForEmbed(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private buildPreviewContext(documentTitle: string): FormatPreviewContext {
    const tenant = this.tenantSession.getTenant();
    const banner = tenant ? heroBannerConfigFromTenant(tenant) : heroBannerConfigFromSession(this.tenantSession);
    const uiLang = this.i18n.currentLang;
    const sample = this.samplePreviewData();
    return {
      banner,
      uiLang,
      gpTitlePrefix: this.i18n.translate('GP.TITLE_PREFIX'),
      helplineLabel: this.i18n.translate('CONTACT.HELPLINE'),
      helplinePhone: tenant?.contactPhone?.trim() ?? '',
      documentTitle: documentTitle.trim(),
      sample
    };
  }

  private previewOfficerName(
    fromTenant: string | null | undefined,
    fallbackEn: string,
    fallbackMr: string
  ): string {
    const trimmed = fromTenant?.trim();
    if (trimmed) {
      return trimmed;
    }
    return this.i18n.currentLang === 'en' ? fallbackEn : fallbackMr;
  }

  private samplePreviewData(): FormatPreviewSample {
    const today = new Date();
    const dateStr =
      this.i18n.currentLang === 'en'
        ? today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : today.toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const en = this.i18n.currentLang === 'en';
    return {
      applicantName: en ? 'Prasad Parab' : 'प्रसाद परब',
      purpose: en ? 'Example reason' : 'उदाहरण कारण',
      mobile: en ? '9405715871' : '९४०५७१५८७१',
      address: en ? 'Adali' : 'आडाळी',
      certificateNumber: 'CERT-2026-0042',
      dateDisplay: dateStr,
      sarpanchName: this.previewOfficerName(
        this.tenantSession.getTenant()?.sarpanchName,
        '(Sarpanch name)',
        '(सरपंचाचे नाव)'
      ),
      gramsevakName: this.previewOfficerName(
        this.tenantSession.getTenant()?.gramsevakName,
        '(Gramsevak name)',
        '(ग्रामसेवकाचे नाव)'
      )
    };
  }

  get filteredTemplates(): AdminFormatTemplate[] {
    const searchQueryLower = this.filterForm.controls.searchTerm.value.trim().toLowerCase();
    return this.templates.filter((item) => {
      const matchesType = this.activeType === 'all' || item.type === this.activeType;
      if (!matchesType) {
        return false;
      }
      if (!searchQueryLower) {
        return true;
      }
      const certLabel = this.certLabelForTemplate(item);
      return (
        item.name.toLowerCase().includes(searchQueryLower) ||
        item.internalNote.toLowerCase().includes(searchQueryLower) ||
        (item.bodyHtml ?? '').toLowerCase().includes(searchQueryLower) ||
        (certLabel && certLabel.toLowerCase().includes(searchQueryLower))
      );
    });
  }

  certLabelForTemplate(item: AdminFormatTemplate): string | null {
    const code = item.certificateTypeCode?.trim();
    if (!code) {
      return null;
    }
    const matchingCertificateType = this.certificateTypes.find((certificateType) => certificateType.code === code);
    return matchingCertificateType ? this.certificateLabel(matchingCertificateType) : code;
  }

  private dtoToTemplate(formatDto: CertificateDocumentFormatDto): AdminFormatTemplate {
    return {
      id: formatDto.id,
      name: formatDto.name,
      type: this.kindToUi(formatDto.formatKind),
      certificateTypeCode: formatDto.certificateTypeCode ?? null,
      documentTitle: formatDto.documentTitle ?? '',
      bodyHtml: formatDto.bodyHtml,
      footerNote: formatDto.footerNote ?? '',
      internalNote: formatDto.internalNote ?? '',
      active: formatDto.active,
      updatedAt: formatDto.updatedAt
    };
  }

  private upsertFromDraft(
    cleanBody: string,
    certificateCode: string | null,
    editor: {
      name: string;
      documentTitle: string;
      footerNote: string;
      internalNote: string;
      formatType: FormatType;
      active: boolean;
    }
  ): CertificateDocumentFormatUpsertRequest {
    return {
      name: editor.name,
      formatKind: this.uiToKind(editor.formatType),
      certificateTypeCode: certificateCode ?? '',
      documentTitle: editor.documentTitle.trim(),
      bodyHtml: cleanBody,
      footerNote: editor.footerNote.trim(),
      internalNote: editor.internalNote.trim(),
      active: editor.active
    };
  }

  private upsertFromTemplate(item: AdminFormatTemplate): CertificateDocumentFormatUpsertRequest {
    return {
      name: item.name,
      formatKind: this.uiToKind(item.type),
      certificateTypeCode: item.certificateTypeCode ?? '',
      documentTitle: item.documentTitle,
      bodyHtml: item.bodyHtml,
      footerNote: item.footerNote,
      internalNote: item.internalNote,
      active: item.active
    };
  }

  private uiToKind(formatType: FormatType): DocumentFormatKind {
    const map: Record<FormatType, DocumentFormatKind> = {
      dakhala: 'DAKHALA',
      bill: 'BILL',
      receipt: 'RECEIPT',
      notice: 'NOTICE',
      other: 'OTHER'
    };
    return map[formatType];
  }

  private kindToUi(apiFormatKind: DocumentFormatKind | string): FormatType {
    const map: Record<string, FormatType> = {
      DAKHALA: 'dakhala',
      BILL: 'bill',
      RECEIPT: 'receipt',
      NOTICE: 'notice',
      OTHER: 'other'
    };
    return map[apiFormatKind] ?? 'other';
  }

  private loadTemplatesLocal(): AdminFormatTemplate[] {
    try {
      const raw =
        sessionStorage.getItem(ADMIN_FORMATS_STORAGE_KEY) ??
        sessionStorage.getItem('smart-gp.admin-formats');
      if (raw) {
        const parsed = JSON.parse(raw) as unknown[];
        return parsed.map((row) => this.migrateRow(row));
      }
    } catch {
      // ignore
    }

    const now = new Date().toISOString();
    const body = this.defaultBodyTemplate();
    return [
      {
        id: crypto.randomUUID(),
        name: this.i18n.translate('ADMIN_FORMATS.SEED_RESIDENCE_NAME'),
        type: 'dakhala',
        certificateTypeCode: null,
        documentTitle: this.i18n.translate('ADMIN_FORMATS.SEED_RESIDENCE_TITLE'),
        bodyHtml: body,
        footerNote: '',
        internalNote: '',
        active: true,
        updatedAt: now
      }
    ];
  }

  private migrateRow(row: unknown): AdminFormatTemplate {
    const parsedRow = row as Partial<AdminFormatTemplate> & {
      description?: string;
      draftDescription?: string;
      internalNote?: string;
    };
    const legacyDesc = (parsedRow.internalNote ?? parsedRow.draftDescription ?? parsedRow.description ?? '').trim();
    const certRaw = parsedRow.certificateTypeCode;
    const certNorm =
      certRaw !== undefined && certRaw !== null && String(certRaw).trim() !== ''
        ? String(certRaw).trim()
        : null;
    return {
      id: parsedRow.id ?? crypto.randomUUID(),
      name: parsedRow.name ?? 'Format',
      type: (parsedRow.type as FormatType) ?? 'dakhala',
      certificateTypeCode: certNorm,
      documentTitle: parsedRow.documentTitle ?? '',
      bodyHtml: (parsedRow.bodyHtml ?? legacyDesc ?? '').trim() || this.defaultBodyTemplate(),
      footerNote: parsedRow.footerNote ?? '',
      internalNote: legacyDesc,
      active: parsedRow.active ?? true,
      updatedAt: parsedRow.updatedAt ?? new Date().toISOString()
    };
  }
}
