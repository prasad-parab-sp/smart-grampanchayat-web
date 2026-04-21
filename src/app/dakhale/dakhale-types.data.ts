/** Mirrors `dakhalaTypes` from master_fixed-3-2.html — replace with API when backend exists. */

export interface DakhalaTypeHeader {
  isHeader: true;
  icon: string;
  titleKey: string;
}

export interface DakhalaTypeItem {
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

export type DakhalaType = DakhalaTypeHeader | DakhalaTypeItem;

export function isDakhalaHeader(row: DakhalaType): row is DakhalaTypeHeader {
  return 'isHeader' in row && row.isHeader === true;
}

export const DAKHALA_TYPES: DakhalaType[] = [
  { isHeader: true, icon: '📄', titleKey: 'DAKHALE.SECTION.CERTIFICATES' },
  {
    icon: '👶',
    nameKey: 'DAKHALE.TYPES.BIRTH_CERT.NAME',
    descKey: 'DAKHALE.TYPES.BIRTH_CERT.DESC',
    fee: 20,
    daysKey: 'DAKHALE.DAYS.D1_2',
    docKeys: [],
    uploadKeys: [],
    extraFields: 'janmDakhala'
  },
  {
    icon: '⚰️',
    nameKey: 'DAKHALE.TYPES.DEATH_CERT.NAME',
    descKey: 'DAKHALE.TYPES.DEATH_CERT.DESC',
    fee: 20,
    daysKey: 'DAKHALE.DAYS.D1_2',
    docKeys: [],
    uploadKeys: [],
    extraFields: 'mrutyuDakhala'
  },
  {
    icon: '💍',
    nameKey: 'DAKHALE.TYPES.MARRIAGE_CERT.NAME',
    descKey: 'DAKHALE.TYPES.MARRIAGE_CERT.DESC',
    fee: 20,
    daysKey: 'DAKHALE.DAYS.D2_3',
    docKeys: [],
    uploadKeys: [],
    extraFields: 'vivahDakhala'
  },
  {
    icon: '👥',
    nameKey: 'DAKHALE.TYPES.POPULATION_CERT.NAME',
    descKey: 'DAKHALE.TYPES.POPULATION_CERT.DESC',
    fee: 20,
    daysKey: 'DAKHALE.DAYS.D2_3',
    docKeys: [],
    uploadKeys: []
  },
  {
    icon: '🏠',
    nameKey: 'DAKHALE.TYPES.RESIDENCE_CERT.NAME',
    descKey: 'DAKHALE.TYPES.RESIDENCE_CERT.DESC',
    fee: 20,
    daysKey: 'DAKHALE.DAYS.D2_3',
    docKeys: [],
    uploadKeys: [],
    extraFields: 'rahivasDakhala'
  },
  {
    icon: '💵',
    nameKey: 'DAKHALE.TYPES.INCOME_CERT.NAME',
    descKey: 'DAKHALE.TYPES.INCOME_CERT.DESC',
    fee: 20,
    daysKey: 'DAKHALE.DAYS.D3_4',
    docKeys: ['DAKHALE.DOCS.AADHAAR', 'DAKHALE.DOCS.LAND_712_IF_FARM'],
    uploadKeys: ['DAKHALE.UPLOADS.AADHAAR', 'DAKHALE.UPLOADS.EXTRACT_712_IF_ANY'],
    extraFields: 'utpannaDakhala'
  },
  {
    icon: '✅',
    nameKey: 'DAKHALE.TYPES.ALIVE_CERT.NAME',
    descKey: 'DAKHALE.TYPES.ALIVE_CERT.DESC',
    fee: 20,
    daysKey: 'DAKHALE.DAYS.D1_2',
    docKeys: ['DAKHALE.DOCS.AADHAAR'],
    uploadKeys: ['DAKHALE.UPLOADS.AADHAAR_PHOTO'],
    extraFields: 'hayatiDakhala'
  },
  {
    icon: '📃',
    nameKey: 'DAKHALE.TYPES.CASTE_CERT.NAME',
    descKey: 'DAKHALE.TYPES.CASTE_CERT.DESC',
    fee: 20,
    daysKey: 'DAKHALE.DAYS.D2_4',
    docKeys: [
      'DAKHALE.DOCS.CASTE_PROOF_LINEAGE',
      'DAKHALE.DOCS.AADHAAR',
      'DAKHALE.DOCS.SCHOOL_LEAVING'
    ],
    uploadKeys: [
      'DAKHALE.UPLOADS.CASTE_PROOF',
      'DAKHALE.UPLOADS.AADHAAR',
      'DAKHALE.UPLOADS.SCHOOL_LEAVING'
    ],
    extraFields: 'jatiDakhala'
  },
  {
    icon: '🚫',
    nameKey: 'DAKHALE.TYPES.NO_OBJ.NAME',
    descKey: 'DAKHALE.TYPES.NO_OBJ.DESC',
    fee: 20,
    daysKey: 'DAKHALE.DAYS.D3_5',
    docKeys: [],
    uploadKeys: [],
    extraFields: 'noObjection'
  },
  {
    icon: '🌾',
    nameKey: 'DAKHALE.TYPES.FARMER_CERT.NAME',
    descKey: 'DAKHALE.TYPES.FARMER_CERT.DESC',
    fee: 20,
    daysKey: 'DAKHALE.DAYS.D2_3',
    docKeys: ['DAKHALE.DOCS.EXTRACT_712', 'DAKHALE.DOCS.AADHAAR'],
    uploadKeys: ['DAKHALE.UPLOADS.EXTRACT_712', 'DAKHALE.UPLOADS.AADHAAR'],
    extraFields: 'shetkari'
  },
  { isHeader: true, icon: '📋', titleKey: 'DAKHALE.SECTION.REGISTRATION' },
  {
    icon: '👶',
    nameKey: 'DAKHALE.TYPES.REG_BIRTH.NAME',
    descKey: 'DAKHALE.TYPES.REG_BIRTH.DESC',
    fee: 0,
    daysKey: 'DAKHALE.DAYS.D1_2',
    docKeys: ['DAKHALE.DOCS.HOSP_BIRTH_CERT', 'DAKHALE.DOCS.PARENTS_AADHAAR'],
    uploadKeys: [
      'DAKHALE.UPLOADS.HOSP_BIRTH_CERT',
      'DAKHALE.UPLOADS.MOTHER_AADHAAR',
      'DAKHALE.UPLOADS.FATHER_AADHAAR'
    ],
    extraFields: 'birth'
  },
  {
    icon: '⚰️',
    nameKey: 'DAKHALE.TYPES.REG_DEATH.NAME',
    descKey: 'DAKHALE.TYPES.REG_DEATH.DESC',
    fee: 0,
    daysKey: 'DAKHALE.DAYS.D1_2',
    docKeys: ['DAKHALE.DOCS.HOSP_DEATH_IF_ANY', 'DAKHALE.DOCS.DECEASED_AADHAAR'],
    uploadKeys: ['DAKHALE.UPLOADS.HOSP_DEATH_CERT', 'DAKHALE.UPLOADS.DECEASED_AADHAAR'],
    extraFields: 'death'
  },
  {
    icon: '💍',
    nameKey: 'DAKHALE.TYPES.REG_MARRIAGE.NAME',
    descKey: 'DAKHALE.TYPES.REG_MARRIAGE.DESC',
    fee: 20,
    daysKey: 'DAKHALE.DAYS.D3_5',
    docKeys: [
      'DAKHALE.DOCS.GROOM_AADHAAR',
      'DAKHALE.DOCS.BRIDE_AADHAAR',
      'DAKHALE.DOCS.WEDDING_PHOTO_TWO',
      'DAKHALE.DOCS.WITNESS_AADHAAR',
      'DAKHALE.DOCS.WEDDING_INVITE'
    ],
    uploadKeys: [
      'DAKHALE.UPLOADS.GROOM_AADHAAR',
      'DAKHALE.UPLOADS.BRIDE_AADHAAR',
      'DAKHALE.UPLOADS.WEDDING_PHOTO',
      'DAKHALE.UPLOADS.WITNESS1_AADHAAR',
      'DAKHALE.UPLOADS.WITNESS2_AADHAAR',
      'DAKHALE.UPLOADS.WEDDING_INVITE',
      'DAKHALE.UPLOADS.APPLICANT_SIGN_PHOTO',
      'DAKHALE.UPLOADS.WITNESS1_SIGN_PHOTO',
      'DAKHALE.UPLOADS.WITNESS2_SIGN_PHOTO'
    ],
    extraFields: 'marriage'
  },
  { isHeader: true, icon: '🏗️', titleKey: 'DAKHALE.SECTION.PERMISSIONS' },
  {
    icon: '🏠',
    nameKey: 'DAKHALE.TYPES.PERM_BUILD.NAME',
    descKey: 'DAKHALE.TYPES.PERM_BUILD.DESC',
    fee: 100,
    daysKey: 'DAKHALE.DAYS.D7_15',
    docKeys: [
      'DAKHALE.DOCS.SITE_712_APPLICANT',
      'DAKHALE.DOCS.NOTARY_PROPERTY_IF_NEEDED',
      'DAKHALE.DOCS.COOWNER_NOC_IF_NEEDED',
      'DAKHALE.DOCS.BUILDING_PLAN'
    ],
    uploadKeys: [
      'DAKHALE.UPLOADS.EXTRACT_712_BUILD_PLOT',
      'DAKHALE.UPLOADS.NOTARY_PROPERTY_IF_ANY',
      'DAKHALE.UPLOADS.COOWNER_NOC_IF_ANY',
      'DAKHALE.UPLOADS.BUILDING_PLAN'
    ],
    extraFields: 'construction'
  },
  {
    icon: '🏪',
    nameKey: 'DAKHALE.TYPES.PERM_BUSINESS.NAME',
    descKey: 'DAKHALE.TYPES.PERM_BUSINESS.DESC',
    fee: 100,
    daysKey: 'DAKHALE.DAYS.D7_10',
    docKeys: [
      'DAKHALE.DOCS.AADHAAR',
      'DAKHALE.DOCS.SHOP_TITLE_OR_LEASE',
      'DAKHALE.DOCS.PASSPORT_PHOTO',
      'DAKHALE.DOCS.PREMISES_ADDRESS_PROOF'
    ],
    uploadKeys: [
      'DAKHALE.UPLOADS.AADHAAR',
      'DAKHALE.UPLOADS.TITLE_OR_LEASE',
      'DAKHALE.UPLOADS.PHOTO'
    ],
    extraFields: 'vyavsay'
  },
  { isHeader: true, icon: '🏠', titleKey: 'DAKHALE.SECTION.SAMPLE_8' },
  {
    icon: '📋',
    nameKey: 'DAKHALE.TYPES.SAMPLE_8.NAME',
    descKey: 'DAKHALE.TYPES.SAMPLE_8.DESC',
    fee: 20,
    daysKey: 'DAKHALE.DAYS.D1_2',
    docKeys: ['DAKHALE.DOCS.AADHAAR', 'DAKHALE.DOCS.HOUSE_ADDRESS_PROOF'],
    uploadKeys: ['DAKHALE.UPLOADS.AADHAAR'],
    extraFields: 'gharpatra8',
    fmtKey: 'DAKHALE.FMT.GHARPATRAK'
  },
  { isHeader: true, icon: '📣', titleKey: 'DAKHALE.SECTION.COMPLAINTS' },
  {
    icon: '📣',
    nameKey: 'DAKHALE.TYPES.COMPLAINT.NAME',
    descKey: 'DAKHALE.TYPES.COMPLAINT.DESC',
    fee: 0,
    daysKey: 'DAKHALE.DAYS.DASH',
    docKeys: [],
    uploadKeys: ['DAKHALE.UPLOADS.COMPLAINT_EVIDENCE'],
    isComplaint: true
  }
];
