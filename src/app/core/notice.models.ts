/** Mirrors API / DB {@code NoticeType}. */
export type NoticeType = 'NOTICE' | 'MEETING' | 'MEMBER' | 'URGENT';

export interface NoticeDto {
  id: string;
  noticeType: NoticeType;
  title: string;
  body: string;
  publishedOn: string;
  expiresOn: string;
  sendToCitizens: boolean;
  sendToMembers: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeUpsertRequest {
  noticeType: NoticeType;
  title: string;
  body: string;
  publishedOn: string;
  expiresOn: string;
  sendToCitizens?: boolean;
  sendToMembers?: boolean;
}

export interface NoticeCreateRequest {
  /** Logged-in staff user id from admin session (API checks tenant + role). */
  staffUserId: string;
  notice: NoticeUpsertRequest;
}

export interface NoticeDeleteRequest {
  /** Same as create — admin session user id; API verifies tenant + role. */
  staffUserId: string;
}

export const NOTICE_TYPES: NoticeType[] = ['NOTICE', 'MEETING', 'MEMBER', 'URGENT'];

export const NOTICE_FILTER_CHIPS: Array<{ key: 'all' | NoticeType; labelKey: string }> = [
  { key: 'all', labelKey: 'NOTICE.FILTER_ALL' },
  { key: 'NOTICE', labelKey: 'NOTICE.TYPE_NOTICE' },
  { key: 'MEETING', labelKey: 'NOTICE.TYPE_MEETING' },
  { key: 'MEMBER', labelKey: 'NOTICE.TYPE_MEMBER' }
];

export function noticeTypeLabelKey(type: NoticeType): string {
  return `NOTICE.TYPE_${type}`;
}

/** True when notice is past its last visible day (expiresOn is inclusive). */
export function isNoticeExpired(notice: Pick<NoticeDto, 'expiresOn'>, todayIso?: string): boolean {
  const today = todayIso ?? isoDateOnly(new Date());
  return notice.expiresOn < today;
}

export function isoDateOnly(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDaysIso(isoDate: string, days: number): string {
  const [y, m, day] = isoDate.split('-').map((x) => parseInt(x, 10));
  const dt = new Date(y, m - 1, day);
  dt.setDate(dt.getDate() + days);
  return isoDateOnly(dt);
}
