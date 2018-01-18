/* global window, document, fetch */

import { createStorage } from './storage';
import { createProviders, PROVIDER_TYPE_MONGODB_CLOUD } from './providers';
import { StitchError } from '../errors';
import * as authCommon from './common';
import * as common from '../common';
import * as _platform from 'detect-browser';

const jwtDecode = require('jwt-decode');

const EMBEDDED_USER_AUTH_DATA_PARTS = 4;

export default class Auth {
  constructor(client, rootUrl, options) {
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

    this.client = client;
    this.rootUrl = rootUrl;
    this.codec = options.codec;
    this.platform = options.platform || _platform;
    this.storage = createStorage(options);
    this.providers = createProviders(this, options);
  }

  /**
   * Create the device info for this client.
   *
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
    return Promise.all([this.client.doSessionPost(), this.getLoggedInProviderType()])
      .then(([json, providerType]) => this.set(json, providerType));
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

    let redirectProvider;
    return Promise.all([
      this.storage.get(authCommon.STATE_KEY),
      this.storage.get(authCommon.STITCH_REDIRECT_PROVIDER)
    ]).then(([ourState, _redirectProvider]) => {
      let redirectFragment = window.location.hash.substring(1);
      redirectProvider = _redirectProvider;
      const redirectState = this.parseRedirectFragment(redirectFragment, ourState);
      if (redirectState.lastError || !redirectProvider) {
        console.error(`StitchClient: error from redirect: ${redirectState.lastError ?
          redirectState.lastError : 'provider type not set'}`);
        this._error = redirectState.lastError;
        window.history.replaceState(null, '', this.pageRootUrl());
        return;
      }

      if (!redirectState.found) {
        return;
      }

      return Promise.all(
        [
          this.storage.remove(authCommon.STATE_KEY),
          this.storage.remove(authCommon.STITCH_REDIRECT_PROVIDER)
        ]
      );
    }).then(() => {
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
    }).then(() => window.history.replaceState(null, '', this.pageRootUrl()));
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
    return Promise.all(
      [
        this.storage.remove(authCommon.USER_AUTH_KEY),
        this.storage.remove(authCommon.REFRESH_TOKEN_KEY),
        this.storage.remove(authCommon.USER_LOGGED_IN_PT_KEY)
      ]
    );
  }

  getDeviceId() {
    return this.storage.get(authCommon.DEVICE_ID_KEY);
  }

  // Returns whether or not the access token is expired or is going to expire within 'withinSeconds'
  // seconds, according to current system time. Returns false if the token is malformed in any way.
  isAccessTokenExpired(withinSeconds = authCommon.DEFAULT_ACCESS_TOKEN_EXPIRE_WITHIN_SECS) {
    return this.getAccessToken().then((token) => {
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
    });
  }

  getAccessToken() {
    return this._get().then(auth =>
      auth.accessToken
    );
  }

  getRefreshToken() {
    return this.storage.get(authCommon.REFRESH_TOKEN_KEY);
  }

  setAuthType(authType) {
    return this.storage.set(authCommon.USER_LOGGED_IN_PT_KEY, authType);
  }

  set(json, authType = '') {
    if (!json) {
      return;
    }

    let newUserAuth = {};

    return (authType ?
      this.storage.set(authCommon.USER_LOGGED_IN_PT_KEY, authType) :
      Promise.resolve()
    ).then(() => {
      if (json[this.codec.refreshToken]) {
        let rt = json[this.codec.refreshToken];
        delete json[this.codec.refreshToken];
        return this.storage.set(authCommon.REFRESH_TOKEN_KEY, rt);
      }
    }).then(() => {
      if (json[this.codec.deviceId]) {
        const deviceId = json[this.codec.deviceId];
        delete json[this.codec.deviceId];
        return this.storage.set(authCommon.DEVICE_ID_KEY, deviceId);
      }
      return;
    }).then(() => {
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

      return this._get();
    }).then((auth) => {
      newUserAuth = Object.assign(auth, newUserAuth);
      return this.storage.set(authCommon.USER_AUTH_KEY, JSON.stringify(newUserAuth));
    });
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
        return this.clear().then(() => {throw new StitchError('Failure retrieving stored auth');});
      }
    });
  }

  getLoggedInProviderType() {
    return this.storage.get(authCommon.USER_LOGGED_IN_PT_KEY).then(type => type || '');
  }

  authedId() {
    return this._get().then((auth) => auth.userId);
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
