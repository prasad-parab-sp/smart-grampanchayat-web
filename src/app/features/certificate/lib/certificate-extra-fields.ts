/**
 * Helpers for certificate-specific additional inputs (`certificate_type_field` / legacy keys).
 * Apply modal does not mount {@link CertificateApplyExtraFieldsComponent} yet — wire when the API returns schema.
 */

export type CertificateExtraNormalized =
  | 'janmDakhala'
  | 'mrutyuDakhala'
  | 'vivahDakhala'
  | 'rahivasDakhala'
  | 'utpannaDakhala'
  | 'hayatiDakhala'
  | 'jatiDakhala'
  | 'noObjection'
  | 'birth'
  | 'death'
  | 'marriage'
  | 'construction'
  | 'vyavsay'
  | 'shetkari'
  | 'gharpatra8'
  | '';

const LEGACY_TO_NORMAL: Readonly<Record<string, CertificateExtraNormalized>> = {
  birthCertificateForm: 'janmDakhala',
  deathCertificateForm: 'mrutyuDakhala',
  marriageCertificateForm: 'vivahDakhala',
  residenceCertificateForm: 'rahivasDakhala',
  birthRegCertificateForm: 'utpannaDakhala',
  lifeCertificateForm: 'hayatiDakhala',
  casteCertificateForm: 'jatiDakhala',
  noObjection: 'noObjection',
  shetkari: 'shetkari',
  birth: 'birth',
  death: 'death',
  marriage: 'marriage',
  construction: 'construction',
  vyavsay: 'vyavsay',
  gharpatra8: 'gharpatra8'
};

export function normalizeCertificateExtraType(raw?: string): CertificateExtraNormalized {
  if (!raw) {
    return '';
  }
  return LEGACY_TO_NORMAL[raw] ?? (raw as CertificateExtraNormalized);
}

export type CertificateExtraErrors = Record<string, string | undefined>;
