export type CitizenTaxStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'WAIVED' | 'CANCELLED';

export type TaxPaymentMode = 'CASH' | 'UPI' | 'CHEQUE' | 'ONLINE' | 'OTHER';

export interface TaxTypeDto {
  id: string;
  nameEn: string;
  nameMr: string;
  description?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaxTypeUpsertRequest {
  nameEn: string;
  nameMr: string;
  description?: string | null;
  active?: boolean | null;
}

export interface TaxTypeCreateRequest {
  staffUserId: string;
  taxType: TaxTypeUpsertRequest;
}

export interface TaxTypePatchRequest {
  staffUserId: string;
  taxType: TaxTypeUpsertRequest;
}

export interface CitizenTaxDto {
  id: string;
  citizenId: string;
  citizenFirstName?: string | null;
  citizenLastName?: string | null;
  citizenMobile?: string | null;
  taxTypeId: string;
  taxTypeNameEn?: string | null;
  taxTypeNameMr?: string | null;
  financialYear: string;
  assessmentNumber?: string | null;
  amountAssessed: number;
  amountOutstanding: number;
  dueDate: string;
  status: CitizenTaxStatus;
  remarks?: string | null;
  createdByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenTaxCreateRequest {
  staffUserId: string;
  taxTypeId: string;
  financialYear: string;
  assessmentNumber?: string | null;
  amountAssessed: number;
  dueDate: string;
  remarks?: string | null;
}

export interface CitizenTaxBulkCreateRequest {
  staffUserId: string;
  citizenIds: string[];
  taxTypeId: string;
  financialYear: string;
  assessmentNumber?: string | null;
  amountAssessed: number;
  dueDate: string;
  remarks?: string | null;
}

export interface CitizenTaxBulkFailure {
  citizenId: string;
  citizenLabel?: string | null;
  reason: string;
}

export interface CitizenTaxBulkCreateResult {
  createdCount: number;
  failedCount: number;
  created: CitizenTaxDto[];
  failures: CitizenTaxBulkFailure[];
}

export interface CitizenTaxWaiveRequest {
  staffUserId: string;
  remarks?: string | null;
}

export interface TaxPaymentDto {
  id: string;
  citizenTaxId: string;
  amount: number;
  paidOn: string;
  paymentMode: TaxPaymentMode;
  receiptNumber: string;
  reference?: string | null;
  recordedByUserId?: string | null;
  createdAt: string;
}

export interface TaxPaymentCreateRequest {
  staffUserId: string;
  amount: number;
  paidOn: string;
  paymentMode: TaxPaymentMode;
  reference?: string | null;
}

export const CITIZEN_TAX_STATUSES: CitizenTaxStatus[] = [
  'PENDING',
  'PARTIAL',
  'PAID',
  'WAIVED',
  'CANCELLED'
];

export const TAX_PAYMENT_MODES: TaxPaymentMode[] = ['CASH', 'UPI', 'CHEQUE', 'ONLINE', 'OTHER'];

export function taxStatusLabelKey(status: CitizenTaxStatus): string {
  return `TAX.STATUS_${status}`;
}

export function isTaxOutstanding(row: CitizenTaxDto): boolean {
  return (
    (row.status === 'PENDING' || row.status === 'PARTIAL') &&
    Number(row.amountOutstanding) > 0
  );
}

/** India FY April–March, e.g. 2025-26 */
export function currentFinancialYear(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const start = m >= 4 ? y : y - 1;
  const endShort = (start + 1) % 100;
  return `${start}-${String(endShort).padStart(2, '0')}`;
}

export function citizenTaxDisplayName(row: CitizenTaxDto): string {
  const first = row.citizenFirstName?.trim() ?? '';
  const last = row.citizenLastName?.trim() ?? '';
  const name = `${first} ${last}`.trim();
  return name || row.citizenMobile?.trim() || row.citizenId;
}

export function taxTypeDisplayName(row: Pick<CitizenTaxDto, 'taxTypeNameEn' | 'taxTypeNameMr'>, lang: 'en' | 'mr'): string {
  const en = row.taxTypeNameEn?.trim();
  const mr = row.taxTypeNameMr?.trim();
  if (lang === 'mr') {
    return mr || en || '—';
  }
  return en || mr || '—';
}
