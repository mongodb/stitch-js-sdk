'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var JSONTYPE = exports.JSONTYPE = 'application/json';
var USER_AUTH_KEY = exports.USER_AUTH_KEY = '_stitch_ua';
var REFRESH_TOKEN_KEY = exports.REFRESH_TOKEN_KEY = '_stitch_rt';
var STATE_KEY = exports.STATE_KEY = '_stitch_state';
var STITCH_ERROR_KEY = exports.STITCH_ERROR_KEY = '_stitch_error';
var STITCH_LINK_KEY = exports.STITCH_LINK_KEY = '_stitch_link';
var IMPERSONATION_ACTIVE_KEY = exports.IMPERSONATION_ACTIVE_KEY = '_stitch_impers_active';
var IMPERSONATION_USER_KEY = exports.IMPERSONATION_USER_KEY = '_stitch_impers_user';
var IMPERSONATION_REAL_USER_AUTH_KEY = exports.IMPERSONATION_REAL_USER_AUTH_KEY = '_stitch_impers_real_ua';
var USER_AUTH_COOKIE_NAME = exports.USER_AUTH_COOKIE_NAME = 'stitch_ua';
var DEFAULT_STITCH_SERVER_URL = exports.DEFAULT_STITCH_SERVER_URL = 'https://stitch.mongodb.com';

var checkStatus = exports.checkStatus = function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  var error = new Error(response.statusText);
  error.response = response;
  throw error;
};

var makeFetchArgs = exports.makeFetchArgs = function makeFetchArgs(method, body) {
  var init = {
    method: method,
    headers: { 'Accept': JSONTYPE, 'Content-Type': JSONTYPE }
  };

  if (body) {
    init.body = body;
  }

  init.cors = true;
  return init;
};

var marshallUserAuth = exports.marshallUserAuth = function marshallUserAuth(data) {
  return data.accessToken + '$' + data.refreshToken + '$' + data.userId + '$' + data.deviceId;
};

var unmarshallUserAuth = exports.unmarshallUserAuth = function unmarshallUserAuth(data) {
  var parts = data.split('$');
  if (parts.length !== 4) {
    throw new RangeError('invalid user auth data provided: ' + data);
  }

  return {
    accessToken: parts[0],
    refreshToken: parts[1],
    userId: parts[2],
    deviceId: parts[3]
  };
};

var parseRedirectFragment = exports.parseRedirectFragment = function parseRedirectFragment(fragment, ourState) {
  // After being redirected from oauth, the URL will look like:
  // https://todo.examples.stitch.mongodb.com/#_stitch_state=...&_stitch_ua=...
  // This function parses out stitch-specific tokens from the fragment and
  // builds an object describing the result.
  var vars = fragment.split('&');
  var result = { ua: null, found: false, stateValid: false, lastError: null };
  var shouldBreak = false;
  for (var i = 0; i < vars.length; ++i) {
    var pairParts = vars[i].split('=');
    var pairKey = decodeURIComponent(pairParts[0]);
    switch (pairKey) {
      case STITCH_ERROR_KEY:
        result.lastError = decodeURIComponent(pairParts[1]);
        result.found = true;
        shouldBreak = true;
        break;
      case USER_AUTH_KEY:
        try {
          result.ua = unmarshallUserAuth(decodeURIComponent(pairParts[1]));
          result.found = true;
        } catch (e) {
          result.lastError = e;
        }
        continue;
      case STITCH_LINK_KEY:
        result.found = true;
        continue;
      case STATE_KEY:
        result.found = true;
        var theirState = decodeURIComponent(pairParts[1]);
        if (ourState && ourState === theirState) {
          result.stateValid = true;
        }
        continue;
      default:
        continue;
    }

    if (shouldBreak) {
      break;
    }
  }

  return result;
};