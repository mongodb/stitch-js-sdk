/* global window, document, fetch */

import { createStorage } from './storage';
import { createProviders } from './providers';
import { StitchError } from '../errors';
import * as authCommon from './common';
import * as common from '../common';

const jwtDecode = require('jwt-decode');

const EMBEDDED_USER_AUTH_DATA_PARTS = 4;

export default class Auth {
  constructor(client, rootUrl, options) {
    options = Object.assign({}, {
      storageType: 'localStorage',
      codec: authCommon.APP_CLIENT_CODEC
    }, options);

    this.client = client;
    this.rootUrl = rootUrl;
    this.codec = options.codec;
    this.storage = createStorage(options.storageType);
    this.providers = createProviders(this);
  }

  provider(name) {
    if (!this.providers.hasOwnProperty(name)) {
      throw new Error('Invalid auth provider specified: ' + name);
    }

    return this.providers[name];
  }

  refreshToken() {
    if (this.isImpersonatingUser()) {
      return this.refreshImpersonation(this.client);
    }

    return this.client.doSessionPost().then(json => this.set(json));
  }

  pageRootUrl() {
    return [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
  }

  error() {
    return this._error;
  }

  isAppClient() {
    if (!this.client) {
      return true; // Handle the case where Auth is constructed with null
    }
    return this.client.type === common.APP_CLIENT_TYPE;
  }

  handleRedirect() {
    if (typeof (window) === 'undefined') {
      // This means we're running in some environment other
      // than a browser - so handling a redirect makes no sense here.
      return;
    }
    if (!window.location || !window.location.hash) {
      return;
    }

    let ourState = this.storage.get(authCommon.STATE_KEY);
    let redirectFragment = window.location.hash.substring(1);
    const redirectState = this.parseRedirectFragment(redirectFragment, ourState);
    if (redirectState.lastError) {
      console.error(`StitchClient: error from redirect: ${redirectState.lastError}`);
      this._error = redirectState.lastError;
      window.history.replaceState(null, '', this.pageRootUrl());
      return;
    }

    if (!redirectState.found) {
      return;
    }

    this.storage.remove(authCommon.STATE_KEY);
    if (!redirectState.stateValid) {
      console.error('StitchClient: state values did not match!');
      window.history.replaceState(null, '', this.pageRootUrl());
      return;
    }

    if (!redirectState.ua) {
      console.error('StitchClient: no UA value was returned from redirect!');
      return;
    }

    // If we get here, the state is valid - set auth appropriately.
    this.set(redirectState.ua);
    window.history.replaceState(null, '', this.pageRootUrl());
  }

  getCookie(name) {
    let splitCookies = document.cookie.split(' ');
    for (let i = 0; i < splitCookies.length; i++) {
      let cookie = splitCookies[i];
      let sepIdx = cookie.indexOf('=');
      let cookieName = cookie.substring(0, sepIdx);
      if (cookieName === name) {
        let cookieVal = cookie.substring(sepIdx + 1, cookie.length);
        if (cookieVal[cookieVal.length - 1] === ';') {
          return cookieVal.substring(0, cookie.length - 1);
        }
        return cookieVal;
      }
    }
  }

  handleCookie() {
    if (typeof (window) === 'undefined' || typeof (document) === 'undefined') {
      // This means we're running in some environment other
      // than a browser - so handling a cookie makes no sense here.
      return;
    }
    if (!document.cookie) {
      return;
    }

    let uaCookie = this.getCookie(authCommon.USER_AUTH_COOKIE_NAME);
    if (!uaCookie) {
      return;
    }

    document.cookie = `${authCommon.USER_AUTH_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    const userAuth = this.unmarshallUserAuth(uaCookie);
    this.set(userAuth);
    window.history.replaceState(null, '', this.pageRootUrl());
  }

  clear() {
    this.storage.remove(authCommon.USER_AUTH_KEY);
    this.storage.remove(authCommon.REFRESH_TOKEN_KEY);
    this.clearImpersonation();
  }

  getDeviceId() {
    return this.storage.get(authCommon.DEVICE_ID_KEY);
  }

  // Returns whether or not the access token is expired or is going to expire within 'withinSeconds'
  // seconds, according to current system time. Returns false if the token is malformed in any way.
  isAccessTokenExpired(withinSeconds = authCommon.DEFAULT_ACCESS_TOKEN_EXPIRE_WITHIN_SECS) {
    let token = this.getAccessToken();
    if (!token) {
      return false;
    }

    let decodedToken;
    try {
      decodedToken = jwtDecode(token);
    } catch (e) {
      return false;
    }

    if (!decodedToken) {
      return false;
    }

    return decodedToken.exp && Math.floor(Date.now() / 1000) >= decodedToken.exp - withinSeconds;
  }

  getAccessToken() {
    return this._get().accessToken;
  }

  getRefreshToken() {
    return this.storage.get(authCommon.REFRESH_TOKEN_KEY);
  }

  set(json) {
    if (!json) {
      return;
    }

    if (json[this.codec.refreshToken]) {
      let rt = json[this.codec.refreshToken];
      delete json[this.codec.refreshToken];
      this.storage.set(authCommon.REFRESH_TOKEN_KEY, rt);
    }

    if (json[this.codec.deviceId]) {
      const deviceId = json[this.codec.deviceId];
      delete json[this.codec.deviceId];
      this.storage.set(authCommon.DEVICE_ID_KEY, deviceId);
    }

    // Merge in new fields with old fields. Typically the first json value
    // is complete with every field inside a user auth, but subsequent requests
    // do not include everything. This merging behavior is safe so long as json
    // value responses with absent fields do not indicate that the field should
    // be unset.
    let newUserAuth = {};
    if (json[this.codec.accessToken]) {
      newUserAuth.accessToken = json[this.codec.accessToken];
    }
    if (json[this.codec.userId]) {
      newUserAuth.userId = json[this.codec.userId];
    }
    newUserAuth = Object.assign(this._get(), newUserAuth);
    this.storage.set(authCommon.USER_AUTH_KEY, JSON.stringify(newUserAuth));
  }

  _get() {
    const data = this.storage.get(authCommon.USER_AUTH_KEY);
    if (!data) {
      return {};
    }

    try {
      return JSON.parse(data);
    } catch (e) {
      // Need to back out and clear auth otherwise we will never
      // be able to do anything useful.
      this.clear();
      throw new StitchError('Failure retrieving stored auth');
    }
  }

  authedId() {
    return this._get().userId;
  }

  isImpersonatingUser() {
    return this.storage.get(authCommon.IMPERSONATION_ACTIVE_KEY) === 'true';
  }

  refreshImpersonation(client) {
    let userId = this.storage.get(authCommon.IMPERSONATION_USER_KEY);
    return client._do(`/admin/users/${userId}/impersonate`, 'POST', { refreshOnFailure: false, useRefreshToken: true })
      .then(response => response.json())
      .then(json => this.set(json))
      .catch(e => {
        this.stopImpersonation();
        throw e;  // rethrow
      });
  }

  startImpersonation(client, userId) {
    if (!this.authedId()) {
      return Promise.reject(new StitchError('Must auth first'));
    }

    if (this.isImpersonatingUser()) {
      return Promise.reject(new StitchError('Already impersonating a user'));
    }

    this.storage.set(authCommon.IMPERSONATION_ACTIVE_KEY, 'true');
    this.storage.set(authCommon.IMPERSONATION_USER_KEY, userId);

    let realUserAuth = JSON.parse(this.storage.get(authCommon.USER_AUTH_KEY));
    this.storage.set(authCommon.IMPERSONATION_REAL_USER_AUTH_KEY, JSON.stringify(realUserAuth));
    return this.refreshImpersonation(client);
  }

  stopImpersonation() {
    if (!this.isImpersonatingUser()) {
      throw new StitchError('Not impersonating a user');
    }

    return new Promise((resolve, reject) => {
      let realUserAuth = JSON.parse(this.storage.get(authCommon.IMPERSONATION_REAL_USER_AUTH_KEY));
      this.set(realUserAuth);
      this.clearImpersonation();
      resolve();
    });
  }

  clearImpersonation() {
    this.storage.remove(authCommon.IMPERSONATION_ACTIVE_KEY);
    this.storage.remove(authCommon.IMPERSONATION_USER_KEY);
    this.storage.remove(authCommon.IMPERSONATION_REAL_USER_AUTH_KEY);
  }

  parseRedirectFragment(fragment, ourState) {
    // After being redirected from oauth, the URL will look like:
    // https://todo.examples.stitch.mongodb.com/#_stitch_state=...&_stitch_ua=...
    // This function parses out stitch-specific tokens from the fragment and
    // builds an object describing the result.
    const vars = fragment.split('&');
    const result = { ua: null, found: false, stateValid: false, lastError: null };
    let shouldBreak = false;
    for (let i = 0; i < vars.length && !shouldBreak; ++i) {
      const pairParts = vars[i].split('=');
      const pairKey = decodeURIComponent(pairParts[0]);
      switch (pairKey) {
      case authCommon.STITCH_ERROR_KEY:
        result.lastError = decodeURIComponent(pairParts[1]);
        result.found = true;
        shouldBreak = true;
        break;
      case authCommon.USER_AUTH_KEY:
        try {
          result.ua = this.unmarshallUserAuth(decodeURIComponent(pairParts[1]));
          result.found = true;
        } catch (e) {
          result.lastError = e;
        }
        continue;
      case authCommon.STITCH_LINK_KEY:
        result.found = true;
        continue;
      case authCommon.STATE_KEY:
        result.found = true;
        let theirState = decodeURIComponent(pairParts[1]);
        if (ourState && ourState === theirState) {
          result.stateValid = true;
        }
        continue;
      default: continue;
      }
    }

    return result;
  }

  unmarshallUserAuth(data) {
    let parts = data.split('$');
    if (parts.length !== EMBEDDED_USER_AUTH_DATA_PARTS) {
      throw new RangeError('invalid user auth data provided: ' + data);
    }

    return {
      [this.codec.accessToken]: parts[0],
      [this.codec.refreshToken]: parts[1],
      [this.codec.userId]: parts[2],
      [this.codec.deviceId]: parts[3]
    };
  }
}
