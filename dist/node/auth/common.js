'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var USER_AUTH_KEY = exports.USER_AUTH_KEY = '_baas_ua';
var REFRESH_TOKEN_KEY = exports.REFRESH_TOKEN_KEY = '_baas_rt';
var DEVICE_ID_KEY = exports.DEVICE_ID_KEY = '_baas_did';
var STATE_KEY = exports.STATE_KEY = '_baas_state';
var USER_AUTH_COOKIE_NAME = exports.USER_AUTH_COOKIE_NAME = 'baas_ua';
var STITCH_ERROR_KEY = exports.STITCH_ERROR_KEY = '_baas_error';
var STITCH_LINK_KEY = exports.STITCH_LINK_KEY = '_baas_link';
var USER_LOGGED_IN_PT_KEY = exports.USER_LOGGED_IN_PT_KEY = '_baas_pt';
var STITCH_REDIRECT_PROVIDER = exports.STITCH_REDIRECT_PROVIDER = '_baas_rp';

var DEFAULT_ACCESS_TOKEN_EXPIRE_WITHIN_SECS = exports.DEFAULT_ACCESS_TOKEN_EXPIRE_WITHIN_SECS = 10;

var APP_CLIENT_CODEC = exports.APP_CLIENT_CODEC = {
  'accessToken': 'access_token',
  'refreshToken': 'refresh_token',
  'deviceId': 'device_id',
  'userId': 'user_id'
};

var ADMIN_CLIENT_CODEC = exports.ADMIN_CLIENT_CODEC = {
  'accessToken': 'access_token',
  'refreshToken': 'refresh_token',
  'deviceId': 'device_id',
  'userId': 'user_id'
};