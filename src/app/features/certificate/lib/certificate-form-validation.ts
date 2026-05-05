import type { CertificateTypeFieldDto } from '../../../core/certificate-type.models';

const EXTRA_NUMBER_OK = /^-?\d+(\.\d+)?$/;

export function isPhoneOk(s: string): boolean {
  return /^\d{10}$/.test(s.trim());
}

/** Mutates {@code errors.name} / {@code errors.phone}; returns whether both fields are valid. */
function validateNamePhoneFields<E extends { name?: string; phone?: string }>(
  form: { name: string; phone: string },
  errors: E
): boolean {
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
  return ok;
}

/**
 * Validates API-driven {@code certificate_type_field} rows: non-FILE values and FILE attachments.
 */
export function validateCertificateTypeExtraFields(
  fields: CertificateTypeFieldDto[] | undefined,
  values: Record<string, string>,
  filesByKey: Record<string, File[]>
): { ok: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!fields?.length) {
    return { ok: true, errors: {} };
  }
  let ok = true;
  const sorted = [...fields].sort((a, b) => a.sortOrder - b.sortOrder);

  for (const f of sorted) {
    if (f.dataType === 'FILE') {
      const list = filesByKey[f.fieldKey] ?? [];
      if (f.required && list.length === 0) {
        errors[f.fieldKey] = 'CERTIFICATE.EXTRA.ERR_REQUIRED';
        ok = false;
      }
      continue;
    }

    const trimmed = (values[f.fieldKey] ?? '').trim();

    if (f.dataType === 'SELECT') {
      if (f.required && !trimmed) {
        errors[f.fieldKey] = 'CERTIFICATE.EXTRA.ERR_SELECT';
        ok = false;
      }
    } else if (f.dataType === 'NUMBER') {
      if (f.required && !trimmed) {
        errors[f.fieldKey] = 'CERTIFICATE.EXTRA.ERR_REQUIRED';
        ok = false;
      } else if (trimmed && !EXTRA_NUMBER_OK.test(trimmed)) {
        errors[f.fieldKey] = 'CERTIFICATE.EXTRA.ERR_NUMBER_INVALID';
        ok = false;
      }
    } else {
      if (f.required && !trimmed) {
        errors[f.fieldKey] = 'CERTIFICATE.EXTRA.ERR_REQUIRED';
        ok = false;
      }
    }
  }

  return { ok, errors };
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
  let ok = validateNamePhoneFields(form, errors);
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
  let ok = validateNamePhoneFields(form, errors);
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
  let ok = validateNamePhoneFields(form, errors);
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
