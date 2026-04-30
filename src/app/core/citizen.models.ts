/** District shard citizen from {@code GET /api/citizens?mobile=} (camelCase JSON). */
export interface Citizen {
  id: string;
  tenantId?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  mobile?: string | null;
}
