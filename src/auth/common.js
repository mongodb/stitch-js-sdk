/* @flow */
export const USER_AUTH_KEY: string = '_stitch_ua';
export const REFRESH_TOKEN_KEY: string = '_stitch_rt';
export const DEVICE_ID_KEY: string = '_stitch_did';
export const STATE_KEY: string = '_stitch_state';
export const IMPERSONATION_ACTIVE_KEY: string = '_stitch_impers_active';
export const IMPERSONATION_USER_KEY: string = '_stitch_impers_user';
export const IMPERSONATION_REAL_USER_AUTH_KEY: string = '_stitch_impers_real_ua';
export const USER_AUTH_COOKIE_NAME: string = 'stitch_ua';
export const STITCH_ERROR_KEY: string = '_stitch_error';
export const STITCH_LINK_KEY: string = '_stitch_link';
export const DEFAULT_ACCESS_TOKEN_EXPIRE_WITHIN_SECS: number = 10;

export type AuthCodec = {
  'accessToken': string,
  'refreshToken': string,
  'deviceId': string,
  'userId': string
};

export const APP_CLIENT_CODEC: AuthCodec = {
  'accessToken': 'access_token',
  'refreshToken': 'refresh_token',
  'deviceId': 'device_id',
  'userId': 'user_id'
};

export const ADMIN_CLIENT_CODEC: AuthCodec = {
  'accessToken': 'access_token',
  'refreshToken': 'refresh_token',
  'deviceId': 'device_id',
  'userId': 'user_id'
};
