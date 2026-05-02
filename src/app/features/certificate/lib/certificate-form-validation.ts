export function isPhoneOk(s: string): boolean {
  return /^\d{10}$/.test(s.trim());
}

export interface CertificateApplyFormModel {
  name: string;
  phone: string;
  purpose: string;
  /** Free-text explanation to supplement the purpose category (optional). */
  purposeDetails: string;
  address: string;
}

export type CertificateApplyFieldErrors = Partial<
  Record<'name' | 'phone' | 'purpose', string | undefined>
>;

export function validateCertificateApply(form: CertificateApplyFormModel): {
  ok: boolean;
  errors: CertificateApplyFieldErrors;
} {
  const errors: CertificateApplyFieldErrors = {};
  let ok = true;
  if (!form.name.trim()) {
    errors.name = 'CERTIFICATE.ERR_NAME_REQUIRED';
    ok = false;
  }
  if (!form.phone.trim()) {
    errors.phone = 'CERTIFICATE.ERR_PHONE_REQUIRED';
    ok = false;
  } else if (!isPhoneOk(form.phone)) {
    errors.phone = 'CERTIFICATE.ERR_PHONE_INVALID';
    ok = false;
  }
  if (!form.purpose) {
    errors.purpose = 'CERTIFICATE.ERR_PURPOSE';
    ok = false;
  }
  return { ok, errors };
}

export interface CertificateComplaintFormModel {
  name: string;
  phone: string;
  subject: string;
  location: string;
  details: string;
}

export type CertificateComplaintFieldErrors = Partial<
  Record<'name' | 'phone' | 'subject' | 'details', string | undefined>
>;

export function validateCertificateComplaint(form: CertificateComplaintFormModel): {
  ok: boolean;
  errors: CertificateComplaintFieldErrors;
} {
  const errors: CertificateComplaintFieldErrors = {};
  let ok = true;
  if (!form.name.trim()) {
    errors.name = 'CERTIFICATE.ERR_NAME_REQUIRED';
    ok = false;
  }
  if (!form.phone.trim()) {
    errors.phone = 'CERTIFICATE.ERR_PHONE_REQUIRED';
    ok = false;
  } else if (!isPhoneOk(form.phone)) {
    errors.phone = 'CERTIFICATE.ERR_PHONE_INVALID';
    ok = false;
  }
  if (!form.subject) {
    errors.subject = 'CERTIFICATE.ERR_SUBJECT';
    ok = false;
  }
  if (!form.details.trim()) {
    errors.details = 'CERTIFICATE.ERR_DETAILS';
    ok = false;
  }
  return { ok, errors };
}

export interface CertificateSuggestionsFormModel {
  name: string;
  phone: string;
  category: string;
  details: string;
  benefit: string;
}

export type CertificateSuggestionsFieldErrors = Partial<
  Record<'name' | 'phone' | 'category' | 'details', string | undefined>
>;

export function validateCertificateSuggestions(form: CertificateSuggestionsFormModel): {
  ok: boolean;
  errors: CertificateSuggestionsFieldErrors;
} {
  const errors: CertificateSuggestionsFieldErrors = {};
  let ok = true;
  if (!form.name.trim()) {
    errors.name = 'CERTIFICATE.ERR_NAME_REQUIRED';
    ok = false;
  }
  if (!form.phone.trim()) {
    errors.phone = 'CERTIFICATE.ERR_PHONE_REQUIRED';
    ok = false;
  } else if (!isPhoneOk(form.phone)) {
    errors.phone = 'CERTIFICATE.ERR_PHONE_INVALID';
    ok = false;
  }
  if (!form.category) {
    errors.category = 'CERTIFICATE.ERR_CATEGORY';
    ok = false;
  }
  if (!form.details.trim()) {
    errors.details = 'CERTIFICATE.ERR_DETAILS';
    ok = false;
  }
  return { ok, errors };
}
