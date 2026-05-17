/** District shard citizen (camelCase JSON). */
export interface Citizen {
  id: string;
  tenantId?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  mobile?: string | null;
}

export type GenderType = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type CitizenStatus = 'active' | 'inactive' | 'deceased' | 'migrated';

export type CitizenRegisterFilter =
  | 'active'
  | 'all'
  | 'voter'
  | 'bpl'
  | 'disabled'
  | 'deceased'
  | 'migrated';

export interface CitizenDto {
  id: string;
  citizenUid: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  dateOfBirth?: string | null;
  gender: GenderType;
  addressLine1?: string | null;
  wardNumber?: string | null;
  mobile?: string | null;
  voterId?: string | null;
  rationCardNumber?: string | null;
  bpl: boolean;
  bplCardNumber?: string | null;
  annualIncome?: number | null;
  disabled: boolean;
  disabilityType?: string | null;
  status: CitizenStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenStatsDto {
  totalActive: number;
  voters: number;
  male: number;
  female: number;
  bpl: number;
  disabled: number;
  deceased: number;
  migrated: number;
}

export interface CitizenRegisterResponse {
  citizens: CitizenDto[];
  stats: CitizenStatsDto;
}

export interface CitizenUpsertRequest {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  dateOfBirth: string;
  gender: GenderType;
  addressLine1?: string | null;
  wardNumber?: string | null;
  mobile?: string | null;
  voterId?: string | null;
  rationCardNumber?: string | null;
  bpl: boolean;
  bplCardNumber?: string | null;
  annualIncome?: number | null;
  disabled: boolean;
  disabilityType?: string | null;
  status: CitizenStatus;
}

export interface CitizenCreateRequest {
  staffUserId: string;
  citizen: CitizenUpsertRequest;
}

export interface CitizenUpdateRequest {
  staffUserId: string;
  citizen: CitizenUpsertRequest;
}

export const CITIZEN_REGISTER_FILTERS: CitizenRegisterFilter[] = [
  'active',
  'all',
  'voter',
  'bpl',
  'disabled',
  'deceased',
  'migrated'
];

export const GENDER_TYPES: GenderType[] = ['male', 'female', 'other'];

export const CITIZEN_STATUSES: CitizenStatus[] = ['active', 'deceased', 'migrated'];

export function citizenRegisterFilterLabelKey(filter: CitizenRegisterFilter): string {
  return `ADMIN_CITIZENS.FILTER_${filter.toUpperCase()}`;
}

export function genderLabelKey(gender: GenderType): string {
  return `ADMIN_CITIZENS.GENDER_${gender.toUpperCase()}`;
}

export function citizenStatusLabelKey(status: CitizenStatus): string {
  return `ADMIN_CITIZENS.STATUS_${status.toUpperCase()}`;
}

export function citizenDtoDisplayName(row: CitizenDto): string {
  return [row.firstName, row.middleName, row.lastName]
    .map((p) => (p ?? '').trim())
    .filter((p) => p.length > 0)
    .join(' ');
}

export function calcCitizenAgeYears(dobIso: string | null | undefined): number | null {
  if (!dobIso) {
    return null;
  }
  const dob = new Date(dobIso);
  if (Number.isNaN(dob.getTime())) {
    return null;
  }
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}
