/** Mirrors API {@link DocumentFormatKind} (Java enum names). */
export type DocumentFormatKind =
  | 'DAKHALA'
  | 'BILL'
  | 'RECEIPT'
  | 'NOTICE'
  | 'OTHER';

export interface CertificateDocumentFormatDto {
  id: string;
  name: string;
  formatKind: DocumentFormatKind;
  certificateTypeId: string | null;
  certificateTypeCode: string | null;
  documentTitle: string | null;
  bodyHtml: string;
  footerNote: string | null;
  /** Internal notes for admins; not printed on issued certificates. */
  internalNote: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateDocumentFormatUpsertRequest {
  name: string;
  formatKind: DocumentFormatKind;
  certificateTypeCode?: string;
  documentTitle?: string;
  bodyHtml: string;
  footerNote?: string;
  internalNote?: string;
  active: boolean;
}
