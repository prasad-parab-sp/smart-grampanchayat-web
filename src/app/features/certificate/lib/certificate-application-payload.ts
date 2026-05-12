import type { CertificateTypeFieldDto } from '../../../core/certificate-type.models';

/**
 * Maps non-FILE {@code certificate_type_field} answers for {@code additionalValues} on submit.
 * FILE slots are skipped until the API accepts uploads.
 */
export function buildCertificateAdditionalValues(
  fields: CertificateTypeFieldDto[] | undefined,
  values: Record<string, string>
): Record<string, unknown> {
  const additionalValues: Record<string, unknown> = {};
  if (!fields?.length) {
    return additionalValues;
  }
  for (const field of fields) {
    if (field.dataType === 'FILE') {
      continue;
    }
    const raw = values[field.fieldKey] ?? '';
    const trimmed = raw.trim();
    if (!trimmed && !field.required) {
      continue;
    }
    switch (field.dataType) {
      case 'NUMBER':
        additionalValues[field.fieldKey] = Number(trimmed);
        break;
      default:
        additionalValues[field.fieldKey] = trimmed;
    }
  }
  return additionalValues;
}
