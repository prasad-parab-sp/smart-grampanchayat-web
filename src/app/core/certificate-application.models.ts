/**
 * Mirrors Java {@code CertificateApplicationSubmitRequest} / {@code CertificateApplicationDto} (Jackson camelCase).
 */
export interface CertificateApplicationSubmitRequest {
  certificateTypeId: string;
  applicantFullName: string;
  applicantMobile: string;
  reasonShort?: string | null;
  reasonDetails?: string | null;
  addressText?: string | null;
  forWhomName?: string | null;
  citizenId: string;
  additionalValues?: Record<string, unknown> | null;
}

export interface CertificateApplicationApproveRequest {
  identifier: string;
  password: string;
  /** Optional: each string is one remark line (Gramsevak), stored before approval completes. */
  remarksToAppend?: string[] | null;
}

/** Same JSON shape as approve — Gramsevak reject with optional remarks. */
export type CertificateApplicationRejectRequest = CertificateApplicationApproveRequest;

export interface CertificateApplicationAddStaffRemarksRequest {
  identifier: string;
  password: string;
  texts: string[];
}

export type CertificateApplicationStatus =
  | 'SUBMITTED'
  | 'PENDING_PAYMENT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface CertificateIssuedDocumentDto {
  applicationNumber: string;
  html: string;
}

export interface CertificateStaffRemarkDto {
  createdAt: string;
  createdByUserId: string;
  text: string;
}

export interface CertificateApplicationDto {
  id: string;
  tenantId: string;
  certificateTypeId: string;
  applicationNumber: string;
  applicantFullName: string;
  applicantMobile: string;
  reasonShort?: string | null;
  reasonDetails?: string | null;
  addressText?: string | null;
  forWhomName?: string | null;
  citizenId?: string | null;
  status: CertificateApplicationStatus;
  submittedAt: string;
  paidAt?: string | null;
  paymentReference?: string | null;
  approvedAt?: string | null;
  approvedByUserId?: string | null;
  additionalValues?: Record<string, unknown>;
  staffRemarks?: CertificateStaffRemarkDto[] | null;
}
