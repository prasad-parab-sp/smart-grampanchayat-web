import type { CertificateTypeFieldDto } from '../../../core/certificate-type.models';

/**
 * Maps non-FILE {@code certificate_type_field} answers for {@code additionalValues} on submit.
 * FILE slots are skipped until the API accepts uploads.
 */
export function buildCertificateAdditionalValues(
  fields: CertificateTypeFieldDto[] | undefined,
  values: Record<string, string>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!fields?.length) {
    return out;
  }
  for (const f of fields) {
    if (f.dataType === 'FILE') {
      continue;
    }
    const raw = values[f.fieldKey] ?? '';
    const trimmed = raw.trim();
    if (!trimmed && !f.required) {
      continue;
    }
    switch (f.dataType) {
      case 'NUMBER':
        out[f.fieldKey] = Number(trimmed);
        break;
      default:
        out[f.fieldKey] = trimmed;
    }
  }
  return out;
}
