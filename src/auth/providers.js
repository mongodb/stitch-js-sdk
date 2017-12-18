// @flow
/** @module auth  */
import * as common from '../common';
import * as authCommon from './common';
import Auth from './index.js';
import { getPlatform, uriEncodeObject } from '../util';

const providers = {
  anon: 'anon',
  apiKey: 'apiKey',
  google: 'google',
  facebook: 'facebook',
  mongodbCloud: 'mongodbCloud',
  userpass: 'userpass',
  custom: 'custom'
};

export type ProviderType = $Keys<typeof providers>;

export interface Provider {
  auth: Auth;
  providerType: ProviderType;

  constructor(auth: Auth): self;
  authenticate(data: any): Promise<string>;
}

type _ProviderCache = { [ProviderType]: Class<Provider> };
export type ProviderMap<T: Provider> = { [ProviderType]: T };

export class ProviderCache {
  auth: Auth;
  _providerCache: _ProviderCache;
  _providerMap: ProviderMap<*>;

  constructor(auth: Auth) {
    this.auth = auth;
    this._providerCache = {
      anon: AnonProvider,
      apiKey: ApiKeyProvider,
      google: GoogleProvider,
      facebook: FacebookProvider,
      mongodbCloud: MongoDBCloudProvider,
      userpass: UserPassProvider,
      custom: CustomProvider
    };
    this._providerMap = {};
  }

  get<T: Provider>(provider: ProviderType): T {
    let providerInst: T = this._providerMap[provider];
    if (providerInst != null) {
      return providerInst;
    }

    const ctor = this._providerCache[provider];
    providerInst = new ctor(this.auth);
    if (providerInst == null) {
      throw new Error('Invalid auth provider specified: ' + provider);
    }
    this._providerMap[provider] = providerInst;
    return providerInst;
  }
}

/**
 * Create the device info for this client.
 *
 * @memberof module:auth
 * @method getDeviceInfo
 * @param {String} deviceId the id of this device
 * @param {String} appId The app ID for this client
 * @param {string} appVersion The version of the app
 * @returns {Object} The device info object
 */
function getDeviceInfo(deviceId: any, appId: string, appVersion: string = '') {
  const deviceInfo: Object = { appId, appVersion, sdkVersion: common.SDK_VERSION };

  if (deviceId) {
    deviceInfo.deviceId = deviceId;
  }

  const platform = getPlatform();

  if (platform) {
    deviceInfo.platform = platform.name;
    deviceInfo.platformVersion = platform.version;
  }

  return deviceInfo;
}

async function _fetchUserId(auth: Auth, url: string, body: Object): Promise<string> {
  const device = getDeviceInfo(
    await auth.getDeviceId(), 
    auth.client.clientAppID
  );

  Object.assign(body, { options: { device }})
  const fetchArgs = common.makeFetchArgs(
    'POST',
    JSON.stringify(body)
  );
  fetchArgs.cors = true;

  const response = await fetch(
    url,
    fetchArgs
  );

  try {
    await common.checkStatus(response);
  } catch (error) {
    return Promise.reject(error);
  }

  const json = await response.json();
  await auth.set(json);

  if (json.userId == null) {
    return json.user_id;
  }

  return json.userId;
}

// @namespace
class AnonProvider implements Provider {
  auth: Auth;
  providerType: ProviderType;

  constructor(auth: Auth) {
    this.auth = auth;
    this.providerType = providers.anon;
  }

  /**
   * Login to a stitch application using anonymous authentication
   *
   * @memberof anonProvider
   * @instance
   * @returns {Promise} a promise that resolves when authentication succeeds.
   */
  async authenticate(): Promise<string> {
    const device = getDeviceInfo(
      await this.auth.getDeviceId(), 
      this.auth.client.clientAppID
    );
    
    return await _fetchUserId(
      this.auth, 
      `${this.auth.rootUrl}/providers/anon-user/login?device=${uriEncodeObject(device)}`,
      device
    );
  }
}

class CustomProvider implements Provider {
  auth: Auth;
  providerType: ProviderType;
  providerRoute: string;
  loginRoute: string;

  constructor(auth: Auth) {
    this.auth = auth;
    this.providerType = providers.custom;
    this.providerRoute = 'providers/custom-token';
    this.loginRoute = `${this.providerRoute}/login`;
  }

  /**
   * Login to a stitch application using custom authentication
   *
   * @memberof customProvider
   * @instance
   * @param {String} JWT token to use for authentication
   * @returns {Promise} a promise that resolves when authentication succeeds.
   */
  async authenticate({ token }: { token: string }): Promise<string> {
    return await _fetchUserId(
      this.auth, 
      `${this.auth.rootUrl}/${this.loginRoute}`, 
      { token }
    );
  }
}

export class UserPassProvider implements Provider {
  auth: Auth;
  providerType: ProviderType;
  // The ternary expression here is redundant but is just preserving previous behavior based on whether or not
  // the client is for the admin or client API.
  providerRoute: string;
  loginRoute: string;

  constructor(auth: Auth) {
    this.auth = auth;
    this.providerType = providers.userpass;
    this.providerRoute = this.auth.isAppClient() ? 'providers/local-userpass' : 'providers/local-userpass';
    this.loginRoute = this.auth.isAppClient() ? `${this.providerRoute}/login` : `${this.providerRoute}/login`;
  }

  /**
   * Login to a stitch application using username and password authentication
   *
   * @memberof userPassProvider
   * @instance
   * @param {String} username the username to use for authentication
   * @param {String} password the password to use for authentication
   * @returns {Promise} a promise that resolves when authentication succeeds.
   */
  async authenticate({ username, password }: { username: string, password: string }): Promise<string> {
    return await _fetchUserId(
      this.auth, 
      `${this.auth.rootUrl}/${this.loginRoute}`, 
      { username, password }
    );
  }

  /**
   * Completes the confirmation workflow from the stitch server
   * @memberof userPassProvider
   * @instance
   * @param {String} tokenId the tokenId provided by the stitch server
   * @param {String} token the token provided by the stitch server
   * @returns {Promise}
   */
  async emailConfirm(tokenId: string, token: string) {
    const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ tokenId, token }));
    fetchArgs.cors = true;

    return fetch(`${this.auth.rootUrl}/${this.providerRoute}/confirm`, fetchArgs)
      .then(common.checkStatus)
      .then(response => response.json());
  }

  /**
   * Request that the stitch server send another email confirmation
   * for account creation.
   *
   * @memberof userPassProvider
   * @instance
   * @param {String} email the email to send a confirmation email for
   * @returns {Promise}
   */
  async sendEmailConfirm(email: string) {
    const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email }));
    fetchArgs.cors = true;

    return fetch(`${this.auth.rootUrl}/${this.providerRoute}/confirm/send`, fetchArgs)
      .then(common.checkStatus)
      .then(response => response.json());
  }

  /**
   * Sends a password reset request to the stitch server
   *
   * @memberof userPassProvider
   * @instance
   * @param {String} email the email of the account to reset the password for
   * @returns {Promise}
   */
  async sendPasswordReset(email: string) {
    const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email }));
    fetchArgs.cors = true;

    return fetch(`${this.auth.rootUrl}/${this.providerRoute}/reset/send`, fetchArgs)
      .then(common.checkStatus)
      .then(response => response.json());
  }

  /**
   * Use information returned from the stitch server to complete the password
   * reset flow for a given email account, providing a new password for the account.
   *
   * @memberof userPassProvider
   * @instance
   * @param {String} tokenId the tokenId provided by the stitch server
   * @param {String} token the token provided by the stitch server
   * @param {String} password the new password requested for this account
   * @returns {Promise}
   */
  async passwordReset(tokenId: string, token: string, password: string) {
    const fetchArgs =
      common.makeFetchArgs('POST', JSON.stringify({ tokenId, token, password }));
    fetchArgs.cors = true;

    return fetch(`${this.auth.rootUrl}/${this.providerRoute}/reset`, fetchArgs)
      .then(common.checkStatus)
      .then(response => response.json());
  }


  /**
   * Will trigger an email to the requested account containing a link with the
   * token and tokenId that must be returned to the server using emailConfirm()
   * to activate the account.
   *
   * @memberof userPassProvider
   * @instance
   * @param {String} email the requested email for the account
   * @param {String} password the requested password for the account
   * @returns {Promise}
   */
  async register(email: string, password: string) {
    const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({ email, password }));
    fetchArgs.cors = true;

    return fetch(`${this.auth.rootUrl}/${this.providerRoute}/register`, fetchArgs)
      .then(common.checkStatus)
      .then(response => response.json());
  }
}

class ApiKeyProvider implements Provider {
  auth: Auth;
  providerType: ProviderType;
  // The ternary expression here is redundant but is just preserving previous behavior based on whether or not
  // the client is for the admin or client API.
  loginRoute: string;

  constructor(auth: Auth) {
    this.auth = auth;
    this.providerType = providers.apiKey;
    this.loginRoute = this.auth.isAppClient() ? 'providers/api-key/login' : 'providers/api-key/login';
  }
  /**
   * Login to a stitch application using an api key
   *
   * @memberof apiKeyProvider
   * @instance
   * @param {String} key the key for authentication
   * @returns {Promise} a promise that resolves when authentication succeeds.
   */
  async authenticate(key: string) {
    return await _fetchUserId(
      this.auth, 
      `${this.auth.rootUrl}/${this.loginRoute}`, 
      { key }
    );
  }
}

class GoogleProvider implements Provider {
  auth: Auth;
  providerType: ProviderType;
  loginRoute: string;

  constructor(auth: Auth) {
    this.auth = auth;
    this.providerType = providers.google;
    this.loginRoute = this.auth.isAppClient() ? 'providers/oauth2-google/login' : 'providers/oauth2-google/login';
  }

  /**
   * Login to a stitch application using google authentication
   *
   * @memberof googleProvider
   * @instance
   * @param {Object} data the redirectUrl data to use for authentication
   * @returns {Promise} a promise that resolves when authentication succeeds.
   */
  async authenticate(data: { authCode : string } & { redirectUrl : ?string }) {
    let { authCode } = data;
    if (authCode !== null) {
      return await _fetchUserId(this.auth, `${this.auth.rootUrl}/${this.loginRoute}`, { authCode })
    }

    const redirectUrl: ?string = (data && data.redirectUrl) ? data.redirectUrl : undefined;
    window.location.replace(getOAuthLoginURL(this.auth, 'google', redirectUrl));
    return Promise.resolve('');
  }
}

class FacebookProvider implements Provider {
  auth: Auth
  providerType: ProviderType;
  loginRoute: string;

  constructor(auth: Auth) {
    this.auth = auth;
    this.providerType = providers.facebook;
    this.loginRoute = this.auth.isAppClient() ? 'providers/oauth2-facebook/login' : 'providers/oauth2-facebook/login';
  }
  
  /**
   * Login to a stitch application using facebook authentication
   *
   * @memberof facebookProvider
   * @instance
   * @param {Object} data the redirectUrl data to use for authentication
   * @returns {Promise} a promise that resolves when authentication succeeds.
   */
  async authenticate(data: { accessToken : string } & { redirectUrl : ?string }) {
    let { accessToken } = data;
    if (accessToken !== null) {
      return await _fetchUserId(this.auth, `${this.auth.rootUrl}/${this.loginRoute}`, { accessToken })
    }

    const redirectUrl: ?string = (data && data.redirectUrl) ? data.redirectUrl : undefined;
    window.location.replace(getOAuthLoginURL(this.auth, 'facebook', redirectUrl));
    return Promise.resolve('');
  }
}

class MongoDBCloudProvider implements Provider {
  auth: Auth
  providerType: ProviderType;
  loginRoute: string;
  
  constructor(auth: Auth) {
    this.auth = auth;
    this.providerType = providers.mongodbCloud;
    this.loginRoute = this.auth.isAppClient() ? 'providers/mongodb-cloud/login' : 'providers/mongodb-cloud/login';
  }

  /**
   * Login to a stitch application using mongodb cloud authentication
   *
   * @memberof mongodbCloudProvider
   * @instance
   * @param {Object} data the username, apiKey, cors, and cookie data to use for authentication
   * @returns {Promise} a promise that resolves when authentication succeeds.
   */
  async authenticate(data: { username: string, apiKey: string, cors: boolean, cookie: string }) {
    const { username, apiKey, cors, cookie } = data;
    const options = Object.assign({}, { cors: true, cookie: false }, { cors: cors, cookie: cookie });
    const device = getDeviceInfo(this.auth.getDeviceId(), this.auth.client.clientAppID);
    const fetchArgs = common.makeFetchArgs(
      'POST',
      JSON.stringify({ username, apiKey, options: { device } })
    );
    fetchArgs.cors = true;  // TODO: shouldn't this use the passed in `cors` value?
    fetchArgs.credentials = 'include';

    let url = `${this.auth.rootUrl}/${this.loginRoute}`;
    if (options.cookie) {
      return fetch(url + '?cookie=true', fetchArgs)
        .then(common.checkStatus);
    }

    const response = await fetch(url, fetchArgs)
    await common.checkStatus(response);
    const json = await response.json();
    this.auth.set(json);
    if (json.userId == null) {
      return json.user_id;
    }

    return json.userId;
  }
}

// The state we generate is to be used for any kind of request where we will
// complete an authentication flow via a redirect. We store the generate in
// a local storage bound to the app's origin. This ensures that any time we
// receive a redirect, there must be a state parameter and it must match
// what we ourselves have generated. This state MUST only be sent to
// a trusted Stitch endpoint in order to preserve its integrity. Stitch will
// store it in some way on its origin (currently a cookie stored on this client)
// and use that state at the end of an auth flow as a parameter in the redirect URI.
const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateState() {
  let state = '';
  for (let i = 0; i < 64; ++i) {
    state += alpha.charAt(Math.floor(Math.random() * alpha.length));
  }

  return state;
}

function getOAuthLoginURL(auth: Auth, providerName: ProviderType, maybeRedirectUrl: ?string) {
  var redirectUrl: string;
  if (maybeRedirectUrl == null) {
    redirectUrl = auth.pageRootUrl();
  } else {
    redirectUrl = maybeRedirectUrl;
  }

  const state = generateState();
  auth.storage.set(authCommon.STATE_KEY, state);

  const device = getDeviceInfo(auth.getDeviceId(), auth.client.clientAppID);

  const result = `${auth.rootUrl}/providers/oauth2-${providerName}/login?redirect=${encodeURI(redirectUrl)}&state=${state}&device=${uriEncodeObject(device)}`;
  return result;
}

export function fetchProvider<T: Provider>(auth: Auth, ctor: Class<T>): T {
  return new ctor(auth);
}

// TODO: support auth-specific options
export function createProviders(auth: Auth, options: any = {}): ProviderMap<*> {
  return {
    anon: new AnonProvider(auth),
    apiKey: new ApiKeyProvider(auth),
    google: new GoogleProvider(auth),
    facebook: new FacebookProvider(auth),
    mongodbCloud: new MongoDBCloudProvider(auth),
    userpass: new UserPassProvider(auth),
    custom: new CustomProvider(auth)
  };
}
