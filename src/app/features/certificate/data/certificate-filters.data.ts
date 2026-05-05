import { CertificateTypeCategory } from '../../../core/certificate-type.models';

/** Quick filter chip: optional {@link codes} / {@link nameKeys}, optional categories; `all` = none. */
export interface CertificateFilterPreset {
  id: string;
  labelKey: string;
  /** API {@link CertificateTypeDto#code} values. */
  codes?: string[];
  /** Legacy allow-list keys (rare). */
  nameKeys?: string[];
  categories?: CertificateTypeCategory[];
}

/** Presets aligned with {@code CertificateTypeCategory} from the API. */
export const CERTIFICATE_API_FILTER_PRESETS: CertificateFilterPreset[] = [
  { id: 'all', labelKey: 'CERTIFICATE.FILTER_ALL' },
  {
    id: 'cat_CERTIFICATE',
    labelKey: 'CERTIFICATE.SECTION.CERTIFICATES',
    categories: [CertificateTypeCategory.CERTIFICATE]
  },
  {
    id: 'cat_REGISTRATION',
    labelKey: 'CERTIFICATE.SECTION.REGISTRATION',
    categories: [CertificateTypeCategory.REGISTRATION]
  },
  {
    id: 'cat_PERMISSIONS',
    labelKey: 'CERTIFICATE.SECTION.LICENSE',
    categories: [CertificateTypeCategory.PERMISSIONS]
  },
  {
    id: 'cat_OTHERS',
    labelKey: 'CERTIFICATE.SECTION.OTHER',
    categories: [CertificateTypeCategory.OTHERS]
  }
];
