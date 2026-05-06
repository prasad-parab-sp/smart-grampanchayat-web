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

export type CertificateApplicationStatus =
  | 'SUBMITTED'
  | 'PENDING_PAYMENT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

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
  additionalValues?: Record<string, unknown>;
}
