/* global window, document, fetch */

import { createStorage } from './storage';
import { createProviders, PROVIDER_TYPE_MONGODB_CLOUD } from './providers';
import { StitchError } from '../errors';
import * as authCommon from './common';
import * as common from '../common';
import * as _platform from 'detect-browser';

const jwtDecode = require('jwt-decode');

const EMBEDDED_USER_AUTH_DATA_PARTS = 4;

/** @private */
export class AuthFactory {
  constructor() {
    throw new StitchError('Auth can only be made from the AuthFactory.create function');
  }

  static create(client, rootUrl, options) {
    return newAuth(client, rootUrl, options);
  }
}

/** @private */
export function newAuth(client, rootUrl, options) {
  let auth = Object.create(Auth.prototype);
  let namespace;
  if (!client || client.clientAppID === '') {
    namespace = 'admin';
  } else {
    namespace = `client.${client.clientAppID}`;
  }

  options = Object.assign({
    codec: authCommon.APP_CLIENT_CODEC,
    namespace: namespace,
    storageType: 'localStorage'
  }, options);

  auth.client = client;
  auth.rootUrl = rootUrl;
  auth.codec = options.codec;
  auth.platform = options.platform || _platform;
  auth.storage = createStorage(options);
  auth.providers = createProviders(auth, options);

  return Promise.all([
    auth._get(),
    auth.storage.get(authCommon.REFRESH_TOKEN_KEY),
    auth.storage.get(authCommon.USER_LOGGED_IN_PT_KEY),
    auth.storage.get(authCommon.DEVICE_ID_KEY)
  ]).then(([authObj, rt, loggedInProviderType, deviceId]) => {
    auth.auth = authObj;
    auth.authedId = authObj.userId;
    auth.rt = rt;
    auth.loggedInProviderType = loggedInProviderType;
    auth.deviceId = deviceId;

    return auth;
  });
}

/** @private */
export class Auth {
  constructor(client, rootUrl, options) {
    throw new StitchError('Auth can only be made from the AuthFactory.create function');
  }

  /**
   * Create the device info for this client.
   *
   * @private
   * @memberof module:auth
   * @method getDeviceInfo
   * @param {String} appId The app ID for this client
   * @param {String} appVersion The version of the app
   * @returns {Object} The device info object
   */
  getDeviceInfo(deviceId, appId, appVersion = '') {
    const deviceInfo = { appId, appVersion, sdkVersion: common.SDK_VERSION };

    if (deviceId) {
      deviceInfo.deviceId = deviceId;
    }

    if (this.platform) {
      deviceInfo.platform = this.platform.name;
      deviceInfo.platformVersion = this.platform.version;
    }

    return deviceInfo;
  }

  provider(name) {
    if (!this.providers.hasOwnProperty(name)) {
      throw new Error('Invalid auth provider specified: ' + name);
    }

    return this.providers[name];
  }

  refreshToken() {
    return this.client.doSessionPost()
      .then((json) => this.set(json));
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

    return Promise.all([
      this.storage.get(authCommon.STATE_KEY),
      this.storage.get(authCommon.STITCH_REDIRECT_PROVIDER)
    ]).then(([ourState, redirectProvider]) => {
      let redirectFragment = window.location.hash.substring(1);
      const redirectState = this.parseRedirectFragment(redirectFragment, ourState);
      if (redirectState.lastError || (redirectState.found && !redirectProvider)) {
        console.error(`StitchClient: error from redirect: ${redirectState.lastError ?
          redirectState.lastError : 'provider type not set'}`);
        this._error = redirectState.lastError;
        window.history.replaceState(null, '', this.pageRootUrl());
        return Promise.reject();
      }

      if (!redirectState.found) {
        return Promise.reject();
      }

      return Promise.all(
        [
          this.storage.remove(authCommon.STATE_KEY),
          this.storage.remove(authCommon.STITCH_REDIRECT_PROVIDER)
        ]
      ).then(() => ({redirectState, redirectProvider}));
    }).then(({redirectState, redirectProvider}) => {
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
      return this.set(redirectState.ua, redirectProvider);
    }).then(() => window.history.replaceState(null, '', this.pageRootUrl()))
      .catch(error => {
        if (error) {
          throw error;
        }
      });
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
    return this.set(userAuth, PROVIDER_TYPE_MONGODB_CLOUD).then(() =>
      window.history.replaceState(null, '', this.pageRootUrl())
    );
  }

  clear() {
    this.auth = null;
    this.authedId = null;
    this.rt = null;
    this.loggedInProviderType = null;

    return Promise.all(
      [
        this.storage.remove(authCommon.USER_AUTH_KEY),
        this.storage.remove(authCommon.REFRESH_TOKEN_KEY),
        this.storage.remove(authCommon.USER_LOGGED_IN_PT_KEY),
        this.storage.remove(authCommon.STITCH_REDIRECT_PROVIDER)
      ]
    );
  }

  getDeviceId() {
    return this.deviceId;
  }

  // Returns whether or not the access token is expired or is going to expire within 'withinSeconds'
  // seconds, according to current system time. Returns false if the token is malformed in any way.
  isAccessTokenExpired(withinSeconds = authCommon.DEFAULT_ACCESS_TOKEN_EXPIRE_WITHIN_SECS) {
    const token = this.getAccessToken();
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
    return this.auth.accessToken;
  }

  getRefreshToken() {
    return this.rt;
  }

  set(json, authType = '') {
    if (!json) {
      return;
    }

    let newUserAuth = {};
    let setters = [];

    if (authType) {
      this.loggedInProviderType = authType;
      setters.push(this.storage.set(authCommon.USER_LOGGED_IN_PT_KEY, authType));
    }

    if (json[this.codec.refreshToken]) {
      this.rt = json[this.codec.refreshToken];
      delete json[this.codec.refreshToken];
      setters.push(this.storage.set(authCommon.REFRESH_TOKEN_KEY, this.rt));
    }

    if (json[this.codec.deviceId]) {
      this.deviceId = json[this.codec.deviceId];
      delete json[this.codec.deviceId];
      setters.push(this.storage.set(authCommon.DEVICE_ID_KEY, this.deviceId));
    }

    // Merge in new fields with old fields. Typically the first json value
    // is complete with every field inside a user auth, but subsequent requests
    // do not include everything. This merging behavior is safe so long as json
    // value responses with absent fields do not indicate that the field should
    // be unset.
    if (json[this.codec.accessToken]) {
      newUserAuth.accessToken = json[this.codec.accessToken];
    }
    if (json[this.codec.userId]) {
      newUserAuth.userId = json[this.codec.userId];
    }

    this.auth = Object.assign(this.auth ? this.auth : {}, newUserAuth);
    this.authedId = this.auth.userId;
    setters.push(this.storage.set(authCommon.USER_AUTH_KEY, JSON.stringify(this.auth)));
    return Promise.all(setters).then(() => this.auth);
  }

  _get() {
    return this.storage.get(authCommon.USER_AUTH_KEY).then((data) => {
      if (!data) {
        return {};
      }

      try {
        return JSON.parse(data);
      } catch (e) {
        // Need to back out and clear auth otherwise we will never
        // be able to do anything useful.
        return this.clear().then(() => {
          throw new StitchError('Failure retrieving stored auth');
        });
      }
    });
  }

  getLoggedInProviderType() {
    return this.loggedInProviderType;
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

  fetchArgsWithLink(fetchArgs, link) {
    if (link) {
      fetchArgs.headers.Authorization = `Bearer ${this.getAccessToken()}`;
    }

    return fetchArgs;
  }
}
