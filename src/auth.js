/* global window, document, fetch */

import { createStorage } from './storage';
import { StitchError } from './errors';
import * as common from './common';

export default class Auth {
  constructor(client, rootUrl, options) {
    options = Object.assign({}, {
      storageType: 'localStorage'
    }, options);

    this.client = client;
    this.rootUrl = rootUrl;
    this.storage = createStorage(options.storageType);

    this.providers = new Map();
    this.providers.set('local', {
      login: (email, password, opts) => {
        if (email === undefined || password === undefined) {
          return this.anonymousAuth();
        }

        return this.localAuth(email, password, opts);
      },
      signup: (email) => {
        throw new Error('not implemented!');
      }
    });

    this.providers.set('apiKey', {
      authenticate: key => {
        return this.apiKeyAuth(key);
      }
    });

    this.providers.set('google', {
      authenticate: data => {
        const { redirectUrl } = data;
        window.location.replace(this.getOAuthLoginURL('google', redirectUrl));
      }
    });

    this.providers.set('facebook', {
      authenticate: data => {
        const { redirectUrl } = data;
        window.location.replace(this.getOAuthLoginURL('facebook', redirectUrl));
      }
    });

    this.providers.set('mongodbCloud', {
      authenticate: data => {
        const { username, apiKey, cors, cookie } = data;
        options = Object.assign({}, { cors: true, cookie: false }, { cors: cors, cookie: cookie });
        return mongodbCloudAuth(username, apiKey, options);
      }
    });
  }

  provider(name) {
    if (!this.providers.has(name)) {
      throw new Error('Invalid auth provider specified: ' + name);
    }

    return this.providers.get(name);
  }

  isAuthenticated() { return false; }

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

  // The state we generate is to be used for any kind of request where we will
  // complete an authentication flow via a redirect. We store the generate in
  // a local storage bound to the app's origin. This ensures that any time we
  // receive a redirect, there must be a state parameter and it must match
  // what we ourselves have generated. This state MUST only be sent to
  // a trusted Stitch endpoint in order to preserve its integrity. Stitch will
  // store it in some way on its origin (currently a cookie stored on this client)
  // and use that state at the end of an auth flow as a parameter in the redirect URI.
  static generateState() {
    let alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let state = '';
    const stateLength = 64;
    for (let i = 0; i < stateLength; i++) {
      let pos = Math.floor(Math.random() * alpha.length);
      state += alpha.substring(pos, pos + 1);
    }

    return state;
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

  getOAuthLoginURL(providerName, redirectUrl) {
    if (redirectUrl === undefined) {
      redirectUrl = this.pageRootUrl();
    }

    let state = Auth.generateState();
    this.storage.set(common.STATE_KEY, state);
    let result = `${this.rootUrl}/oauth2/${providerName}?redirect=${encodeURI(redirectUrl)}&state=${state}`;
    return result;
  }

  anonymousAuth() {
    let fetchArgs = common.makeFetchArgs('GET');
    fetchArgs.cors = true;

    return fetch(`${this.rootUrl}/anon/user`, fetchArgs)
      .then(common.checkStatus)
      .then(response => response.json())
      .then(json => this.set(json));
  }

  apiKeyAuth(key) {
    const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({'key': key}));
    fetchArgs.cors = true;

    return fetch(`${this.rootUrl}/api/key`, fetchArgs)
      .then(common.checkStatus)
      .then(response => response.json())
      .then(json => this.set(json));
  }

  emailConfirm(tokenId, token) {
    const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({tokenId, token}));
    fetchArgs.cors = true;
    return fetch(`${this.rootUrl}/local/userpass/confirm`, fetchArgs)
      .then(common.checkStatus)
      .then(response => response.json())
      .then(json => this.set(json));
  }

  sendEmailConfirm(email) {
    const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({email}));
    fetchArgs.cors = true;
    return fetch(`${this.rootUrl}/local/userpass/confirm/send`, fetchArgs)
      .then(common.checkStatus)
      .then(response => response.json())
      .then(json => this.set(json));
  }

  sendPasswordReset(email) {
    const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({email}));
    fetchArgs.cors = true;
    return fetch(`${this.rootUrl}/local/userpass/reset/send`, fetchArgs)
      .then(common.checkStatus)
      .then(response => response.json())
      .then(json => this.set(json));
  }

  passwordReset(tokenId, token) {
    const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({tokenId, token}));
    fetchArgs.cors = true;
    return fetch(`${this.rootUrl}/local/userpass/reset`, fetchArgs)
      .then(common.checkStatus)
      .then(response => response.json())
      .then(json => this.set(json));
  }

  register(email, password) {
    const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({email, password}));
    fetchArgs.cors = true;
    return fetch(`${this.rootUrl}/local/userpass/register`, fetchArgs)
      .then(common.checkStatus)
      .then(response => response.json())
      .then(json => this.set(json));
  }

  localAuth(username, password, options = {cors: true}) {
    const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({username, password}));
    fetchArgs.cors = true;

    return fetch(`${this.rootUrl}/local/userpass`, fetchArgs)
      .then(common.checkStatus)
      .then(response => response.json())
      .then(json => this.set(json));
  }

  mongodbCloudAuth(username, apiKey, options = {cors: true, cookie: false}) {
    const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({username, apiKey}));
    fetchArgs.cors = true;
    fetchArgs.credentials = 'include';

    let url = `${this.rootUrl}/mongodb/cloud`;
    if (!options.cookie) {
      return fetch(url, fetchArgs)
        .then(common.checkStatus)
        .then(response => response.json())
        .then(json => this.set(json));
    }

    return fetch(url + '?cookie=true', fetchArgs)
      .then(common.checkStatus);
  }

  clear() {
    this.storage.remove(common.USER_AUTH_KEY);
    this.storage.remove(common.REFRESH_TOKEN_KEY);
    this.clearImpersonation();
  }

  getRefreshToken() {
    return this.storage.get(common.REFRESH_TOKEN_KEY);
  }

  set(json) {
    let rt = json.refreshToken;
    delete json.refreshToken;

    this.storage.set(common.USER_AUTH_KEY, JSON.stringify(json));
    this.storage.set(common.REFRESH_TOKEN_KEY, rt);
    return json;
  }

  get() {
    if (!this.storage.get(common.USER_AUTH_KEY)) {
      return null;
    }

    const item = this.storage.get(common.USER_AUTH_KEY);
    try {
      return JSON.parse(item);
    } catch (e) {
      // Need to back out and clear auth otherwise we will never
      // be able to do anything useful.
      this.clear();
      throw new StitchError('Failure retrieving stored auth');
    }
  }

  authedId() {
    return ((this.get() || {}).user || {})._id;
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
