/** Mirrors `certificateCatalog` from master_fixed-3-2.html — replace with API when backend exists. */

export interface CertificateCatalogRowHeader {
  isHeader: true;
  icon: string;
  titleKey: string;
}

export interface CertificateListItem {
  icon: string;
  nameKey: string;
  descKey: string;
  fee: number;
  daysKey: string;
  docKeys: string[];
  uploadKeys: string[];
  extraFields?: string;
  /** i18n key when a format label is needed (e.g. house register). */
  fmtKey?: string;
  isComplaint?: boolean;
}

export type CertificateCatalogRow = CertificateCatalogRowHeader | CertificateListItem;

export function isCertificateSectionHeader(row: CertificateCatalogRow): row is CertificateCatalogRowHeader {
  return 'isHeader' in row && row.isHeader === true;
}

export const CERTIFICATE_CATALOG: CertificateCatalogRow[] = [
  { isHeader: true, icon: '📄', titleKey: 'CERTIFICATE.SECTION.CERTIFICATES' },
  {
    icon: '👶',
    nameKey: 'CERTIFICATE.TYPES.BIRTH_CERT.NAME',
    descKey: 'CERTIFICATE.TYPES.BIRTH_CERT.DESC',
    fee: 20,
    daysKey: 'CERTIFICATE.DAYS.D1_2',
    docKeys: [],
    uploadKeys: [],
    extraFields: 'birthCertificateForm'
  },
  {
    icon: '⚰️',
    nameKey: 'CERTIFICATE.TYPES.DEATH_CERT.NAME',
    descKey: 'CERTIFICATE.TYPES.DEATH_CERT.DESC',
    fee: 20,
    daysKey: 'CERTIFICATE.DAYS.D1_2',
    docKeys: [],
    uploadKeys: [],
    extraFields: 'deathCertificateForm'
  },
  {
    icon: '💍',
    nameKey: 'CERTIFICATE.TYPES.MARRIAGE_CERT.NAME',
    descKey: 'CERTIFICATE.TYPES.MARRIAGE_CERT.DESC',
    fee: 20,
    daysKey: 'CERTIFICATE.DAYS.D2_3',
    docKeys: [],
    uploadKeys: [],
    extraFields: 'marriageCertificateForm'
  },
  {
    icon: '👥',
    nameKey: 'CERTIFICATE.TYPES.POPULATION_CERT.NAME',
    descKey: 'CERTIFICATE.TYPES.POPULATION_CERT.DESC',
    fee: 20,
    daysKey: 'CERTIFICATE.DAYS.D2_3',
    docKeys: [],
    uploadKeys: []
  },
  {
    icon: '🏠',
    nameKey: 'CERTIFICATE.TYPES.RESIDENCE_CERT.NAME',
    descKey: 'CERTIFICATE.TYPES.RESIDENCE_CERT.DESC',
    fee: 20,
    daysKey: 'CERTIFICATE.DAYS.D2_3',
    docKeys: [],
    uploadKeys: [],
    extraFields: 'residenceCertificateForm'
  },
  {
    icon: '💵',
    nameKey: 'CERTIFICATE.TYPES.INCOME_CERT.NAME',
    descKey: 'CERTIFICATE.TYPES.INCOME_CERT.DESC',
    fee: 20,
    daysKey: 'CERTIFICATE.DAYS.D3_4',
    docKeys: ['CERTIFICATE.DOCS.AADHAAR', 'CERTIFICATE.DOCS.LAND_712_IF_FARM'],
    uploadKeys: ['CERTIFICATE.UPLOADS.AADHAAR', 'CERTIFICATE.UPLOADS.EXTRACT_712_IF_ANY'],
    extraFields: 'birthRegCertificateForm'
  },
  {
    icon: '✅',
    nameKey: 'CERTIFICATE.TYPES.ALIVE_CERT.NAME',
    descKey: 'CERTIFICATE.TYPES.ALIVE_CERT.DESC',
    fee: 20,
    daysKey: 'CERTIFICATE.DAYS.D1_2',
    docKeys: ['CERTIFICATE.DOCS.AADHAAR'],
    uploadKeys: ['CERTIFICATE.UPLOADS.AADHAAR_PHOTO'],
    extraFields: 'lifeCertificateForm'
  },
  {
    icon: '📃',
    nameKey: 'CERTIFICATE.TYPES.CASTE_CERT.NAME',
    descKey: 'CERTIFICATE.TYPES.CASTE_CERT.DESC',
    fee: 20,
    daysKey: 'CERTIFICATE.DAYS.D2_4',
    docKeys: [
      'CERTIFICATE.DOCS.CASTE_PROOF_LINEAGE',
      'CERTIFICATE.DOCS.AADHAAR',
      'CERTIFICATE.DOCS.SCHOOL_LEAVING'
    ],
    uploadKeys: [
      'CERTIFICATE.UPLOADS.CASTE_PROOF',
      'CERTIFICATE.UPLOADS.AADHAAR',
      'CERTIFICATE.UPLOADS.SCHOOL_LEAVING'
    ],
    extraFields: 'casteCertificateForm'
  },
  {
    icon: '🚫',
    nameKey: 'CERTIFICATE.TYPES.NO_OBJ.NAME',
    descKey: 'CERTIFICATE.TYPES.NO_OBJ.DESC',
    fee: 20,
    daysKey: 'CERTIFICATE.DAYS.D3_5',
    docKeys: [],
    uploadKeys: [],
    extraFields: 'noObjection'
  },
  {
    icon: '🌾',
    nameKey: 'CERTIFICATE.TYPES.FARMER_CERT.NAME',
    descKey: 'CERTIFICATE.TYPES.FARMER_CERT.DESC',
    fee: 20,
    daysKey: 'CERTIFICATE.DAYS.D2_3',
    docKeys: ['CERTIFICATE.DOCS.EXTRACT_712', 'CERTIFICATE.DOCS.AADHAAR'],
    uploadKeys: ['CERTIFICATE.UPLOADS.EXTRACT_712', 'CERTIFICATE.UPLOADS.AADHAAR'],
    extraFields: 'shetkari'
  },
  { isHeader: true, icon: '📋', titleKey: 'CERTIFICATE.SECTION.REGISTRATION' },
  {
    icon: '👶',
    nameKey: 'CERTIFICATE.TYPES.REG_BIRTH.NAME',
    descKey: 'CERTIFICATE.TYPES.REG_BIRTH.DESC',
    fee: 0,
    daysKey: 'CERTIFICATE.DAYS.D1_2',
    docKeys: ['CERTIFICATE.DOCS.HOSP_BIRTH_CERT', 'CERTIFICATE.DOCS.PARENTS_AADHAAR'],
    uploadKeys: [
      'CERTIFICATE.UPLOADS.HOSP_BIRTH_CERT',
      'CERTIFICATE.UPLOADS.MOTHER_AADHAAR',
      'CERTIFICATE.UPLOADS.FATHER_AADHAAR'
    ],
    extraFields: 'birth'
  },
  {
    icon: '⚰️',
    nameKey: 'CERTIFICATE.TYPES.REG_DEATH.NAME',
    descKey: 'CERTIFICATE.TYPES.REG_DEATH.DESC',
    fee: 0,
    daysKey: 'CERTIFICATE.DAYS.D1_2',
    docKeys: ['CERTIFICATE.DOCS.HOSP_DEATH_IF_ANY', 'CERTIFICATE.DOCS.DECEASED_AADHAAR'],
    uploadKeys: ['CERTIFICATE.UPLOADS.HOSP_DEATH_CERT', 'CERTIFICATE.UPLOADS.DECEASED_AADHAAR'],
    extraFields: 'death'
  },
  {
    icon: '💍',
    nameKey: 'CERTIFICATE.TYPES.REG_MARRIAGE.NAME',
    descKey: 'CERTIFICATE.TYPES.REG_MARRIAGE.DESC',
    fee: 20,
    daysKey: 'CERTIFICATE.DAYS.D3_5',
    docKeys: [
      'CERTIFICATE.DOCS.GROOM_AADHAAR',
      'CERTIFICATE.DOCS.BRIDE_AADHAAR',
      'CERTIFICATE.DOCS.WEDDING_PHOTO_TWO',
      'CERTIFICATE.DOCS.WITNESS_AADHAAR',
      'CERTIFICATE.DOCS.WEDDING_INVITE'
    ],
    uploadKeys: [
      'CERTIFICATE.UPLOADS.GROOM_AADHAAR',
      'CERTIFICATE.UPLOADS.BRIDE_AADHAAR',
      'CERTIFICATE.UPLOADS.WEDDING_PHOTO',
      'CERTIFICATE.UPLOADS.WITNESS1_AADHAAR',
      'CERTIFICATE.UPLOADS.WITNESS2_AADHAAR',
      'CERTIFICATE.UPLOADS.WEDDING_INVITE',
      'CERTIFICATE.UPLOADS.APPLICANT_SIGN_PHOTO',
      'CERTIFICATE.UPLOADS.WITNESS1_SIGN_PHOTO',
      'CERTIFICATE.UPLOADS.WITNESS2_SIGN_PHOTO'
    ],
    extraFields: 'marriage'
  },
  { isHeader: true, icon: '🏗️', titleKey: 'CERTIFICATE.SECTION.PERMISSIONS' },
  {
    icon: '🏠',
    nameKey: 'CERTIFICATE.TYPES.PERM_BUILD.NAME',
    descKey: 'CERTIFICATE.TYPES.PERM_BUILD.DESC',
    fee: 100,
    daysKey: 'CERTIFICATE.DAYS.D7_15',
    docKeys: [
      'CERTIFICATE.DOCS.SITE_712_APPLICANT',
      'CERTIFICATE.DOCS.NOTARY_PROPERTY_IF_NEEDED',
      'CERTIFICATE.DOCS.COOWNER_NOC_IF_NEEDED',
      'CERTIFICATE.DOCS.BUILDING_PLAN'
    ],
    uploadKeys: [
      'CERTIFICATE.UPLOADS.EXTRACT_712_BUILD_PLOT',
      'CERTIFICATE.UPLOADS.NOTARY_PROPERTY_IF_ANY',
      'CERTIFICATE.UPLOADS.COOWNER_NOC_IF_ANY',
      'CERTIFICATE.UPLOADS.BUILDING_PLAN'
    ],
    extraFields: 'construction'
  },
  {
    icon: '🏪',
    nameKey: 'CERTIFICATE.TYPES.PERM_BUSINESS.NAME',
    descKey: 'CERTIFICATE.TYPES.PERM_BUSINESS.DESC',
    fee: 100,
    daysKey: 'CERTIFICATE.DAYS.D7_10',
    docKeys: [
      'CERTIFICATE.DOCS.AADHAAR',
      'CERTIFICATE.DOCS.SHOP_TITLE_OR_LEASE',
      'CERTIFICATE.DOCS.PASSPORT_PHOTO',
      'CERTIFICATE.DOCS.PREMISES_ADDRESS_PROOF'
    ],
    uploadKeys: [
      'CERTIFICATE.UPLOADS.AADHAAR',
      'CERTIFICATE.UPLOADS.TITLE_OR_LEASE',
      'CERTIFICATE.UPLOADS.PHOTO'
    ],
    extraFields: 'vyavsay'
  },
  { isHeader: true, icon: '🏠', titleKey: 'CERTIFICATE.SECTION.SAMPLE_8' },
  {
    icon: '📋',
    nameKey: 'CERTIFICATE.TYPES.SAMPLE_8.NAME',
    descKey: 'CERTIFICATE.TYPES.SAMPLE_8.DESC',
    fee: 20,
    daysKey: 'CERTIFICATE.DAYS.D1_2',
    docKeys: ['CERTIFICATE.DOCS.AADHAAR', 'CERTIFICATE.DOCS.HOUSE_ADDRESS_PROOF'],
    uploadKeys: ['CERTIFICATE.UPLOADS.AADHAAR'],
    extraFields: 'gharpatra8',
    fmtKey: 'CERTIFICATE.FMT.GHARPATRAK'
  },
  { isHeader: true, icon: '📣', titleKey: 'CERTIFICATE.SECTION.COMPLAINTS' },
  {
    icon: '📣',
    nameKey: 'CERTIFICATE.TYPES.COMPLAINT.NAME',
    descKey: 'CERTIFICATE.TYPES.COMPLAINT.DESC',
    fee: 0,
    daysKey: 'CERTIFICATE.DAYS.DASH',
    docKeys: [],
    uploadKeys: ['CERTIFICATE.UPLOADS.COMPLAINT_EVIDENCE'],
    isComplaint: true
  }
];
