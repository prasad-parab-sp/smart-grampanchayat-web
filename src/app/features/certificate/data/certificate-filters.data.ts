/** Quick filter chip for the certificate list (nameKey allow-list; `all` = no filter). */
export interface CertificateFilterPreset {
  id: string;
  labelKey: string;
  nameKeys: string[];
}

export const CERTIFICATE_FILTER_PRESETS: CertificateFilterPreset[] = [
  { id: 'all', labelKey: 'CERTIFICATE.FILTER_ALL', nameKeys: [] },
  {
    id: 'birth',
    labelKey: 'CERTIFICATE.FILTER_BIRTH',
    nameKeys: ['CERTIFICATE.TYPES.BIRTH_CERT.NAME', 'CERTIFICATE.TYPES.REG_BIRTH.NAME']
  },
  {
    id: 'death',
    labelKey: 'CERTIFICATE.FILTER_DEATH',
    nameKeys: ['CERTIFICATE.TYPES.DEATH_CERT.NAME', 'CERTIFICATE.TYPES.REG_DEATH.NAME']
  },
  { id: 'income', labelKey: 'CERTIFICATE.FILTER_INCOME', nameKeys: ['CERTIFICATE.TYPES.INCOME_CERT.NAME'] },
  {
    id: 'complaint',
    labelKey: 'CERTIFICATE.FILTER_COMPLAINT',
    nameKeys: ['CERTIFICATE.TYPES.COMPLAINT.NAME']
  }
];
