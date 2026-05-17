export interface PlatformAdminLoginRequest {
  mobile: string;
  password: string;
}

export interface PlatformAdminLoginResponse {
  id: string;
  mobile: string;
  displayName: string;
  role: 'super_admin' | 'platform_admin';
}

export interface PlatformStats {
  districtsTotal: number;
  districtsActive: number;
  gramPanchayatsTotal: number;
  gramPanchayatsActive: number;
}
