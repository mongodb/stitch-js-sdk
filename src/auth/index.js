/* global window, document, fetch */

import { createStorage } from './storage';
import { createProviders } from './providers';
import { StitchError } from '../errors';
import * as common from '../common';

export default class Auth {
  constructor(client, rootUrl, options) {
    options = Object.assign({}, {
      storageType: 'localStorage'
    }, options);

    this.client = client;
    this.rootUrl = rootUrl;
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

    const requestOptions = { refreshOnFailure: false, useRefreshToken: true };
    return this.client._do('/auth/newAccessToken', 'POST', requestOptions)
      .then(response => response.json())
      .then(json => this.setAccessToken(json.accessToken));
  }

  pageRootUrl() {
    return [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
  }

  setAccessToken(token) {
    let currAuth = this.get();
    currAuth.accessToken = token;
    currAuth.refreshToken = this.storage.get(common.REFRESH_TOKEN_KEY);
    this.set(currAuth);
  }

  error() {
    return this._error;
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

    let ourState = this.storage.get(common.STATE_KEY);
    let redirectFragment = window.location.hash.substring(1);
    const redirectState = common.parseRedirectFragment(redirectFragment, ourState);
    if (redirectState.lastError) {
      console.error(`StitchClient: error from redirect: ${redirectState.lastError}`);
      this._error = redirectState.lastError;
      window.history.replaceState(null, '', this.pageRootUrl());
      return;
    }

    if (!redirectState.found) {
      return;
    }

    this.storage.remove(common.STATE_KEY);
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

    let uaCookie = this.getCookie(common.USER_AUTH_COOKIE_NAME);
    if (!uaCookie) {
      return;
    }

    document.cookie = `${common.USER_AUTH_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    const userAuth = common.unmarshallUserAuth(uaCookie);
    this.set(userAuth);
    window.history.replaceState(null, '', this.pageRootUrl());
  }

  clear() {
    this.storage.remove(common.USER_AUTH_KEY);
    this.storage.remove(common.REFRESH_TOKEN_KEY);
    this.clearImpersonation();
  }

  getAccessToken() {
    return this.get()['accessToken'];
  }

  getRefreshToken() {
    return this.storage.get(common.REFRESH_TOKEN_KEY);
  }

  set(json) {
    if (json && json.refreshToken) {
      let rt = json.refreshToken;
      delete json.refreshToken;
      this.storage.set(common.REFRESH_TOKEN_KEY, rt);
    }

    this.storage.set(common.USER_AUTH_KEY, JSON.stringify(json));
    return json;
  }

  get() {
    const data = this.storage.get(common.USER_AUTH_KEY);
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
    const authData = this.get();
    if (authData.user) {
      return authData.user._id;
    }

    return authData.userId;
  }

  isImpersonatingUser() {
    return this.storage.get(common.IMPERSONATION_ACTIVE_KEY) === 'true';
  }

  refreshImpersonation(client) {
    let userId = this.storage.get(common.IMPERSONATION_USER_KEY);
    return client._do(`/admin/users/${userId}/impersonate`, 'POST', { refreshOnFailure: false, useRefreshToken: true })
      .then(response => response.json())
      .then(json => {
        json.refreshToken = this.storage.get(common.REFRESH_TOKEN_KEY);
        this.set(json);
      })
      .catch(e => {
        this.stopImpersonation();
        throw e;  // rethrow
      });
  }

  startImpersonation(client, userId) {
    if (this.get() === null) {
      return Promise.reject(new StitchError('Must auth first'));
    }

    if (this.isImpersonatingUser()) {
      return Promise.reject(new StitchError('Already impersonating a user'));
    }

    this.storage.set(common.IMPERSONATION_ACTIVE_KEY, 'true');
    this.storage.set(common.IMPERSONATION_USER_KEY, userId);

    let realUserAuth = JSON.parse(this.storage.get(common.USER_AUTH_KEY));
    realUserAuth.refreshToken = this.storage.get(common.REFRESH_TOKEN_KEY);
    this.storage.set(common.IMPERSONATION_REAL_USER_AUTH_KEY, JSON.stringify(realUserAuth));
    return this.refreshImpersonation(client);
  }

  stopImpersonation() {
    if (!this.isImpersonatingUser()) {
      throw new StitchError('Not impersonating a user');
    }

    return new Promise((resolve, reject) => {
      let realUserAuth = JSON.parse(this.storage.get(common.IMPERSONATION_REAL_USER_AUTH_KEY));
      this.set(realUserAuth);
      this.clearImpersonation();
      resolve();
    });
  }

  clearImpersonation() {
    this.storage.remove(common.IMPERSONATION_ACTIVE_KEY);
    this.storage.remove(common.IMPERSONATION_USER_KEY);
    this.storage.remove(common.IMPERSONATION_REAL_USER_AUTH_KEY);
  }
}
