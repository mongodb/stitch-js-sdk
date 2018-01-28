/* global window, fetch */
/* eslint no-labels: ['error', { 'allowLoop': true }] */
import 'fetch-everywhere';
import { AuthFactory } from './auth';
import { PROVIDER_TYPE_ANON } from './auth/providers';
import { APP_CLIENT_CODEC } from './auth/common';
import ServiceRegistry from './services';
import * as common from './common';
import ExtJSON from 'mongodb-extjson';
import queryString from 'query-string';
import {
  StitchError,
  ErrInvalidSession,
  ErrUnauthorized
} from './errors';

const v1 = 1;
const v2 = 2;
const v3 = 3;
const API_TYPE_PUBLIC = 'public';
const API_TYPE_PRIVATE = 'private';
const API_TYPE_CLIENT = 'client';
const API_TYPE_APP = 'app';

/**
  * Factory class to create a new StitchClient asynchronously.
  */
export class StitchClientFactory {
  constructor() {
    throw new StitchError('StitchClient can only be made from the StitchClientFactory.create function');
  }

  static create(clientAppID, options = {}) {
    return newStitchClient(StitchClient.prototype, clientAppID, options);
  }
}

export function newStitchClient(prototype, clientAppID, options = {}) {
  let stitchClient = Object.create(prototype);
  let baseUrl = common.DEFAULT_STITCH_SERVER_URL;
  if (options.baseUrl) {
    baseUrl = options.baseUrl;
  }

  stitchClient.clientAppID = clientAppID;

  stitchClient.authUrl = (
    clientAppID ?
      `${baseUrl}/api/client/v2.0/app/${clientAppID}/auth` :
      `${baseUrl}/api/admin/v3.0/auth`
  );

  stitchClient.rootURLsByAPIVersion = {
    [v1]: {
      [API_TYPE_PUBLIC]: `${baseUrl}/api/public/v1.0`,
      [API_TYPE_CLIENT]: `${baseUrl}/api/client/v1.0`,
      [API_TYPE_PRIVATE]: `${baseUrl}/api/private/v1.0`,
      [API_TYPE_APP]: (clientAppID ?
        `${baseUrl}/api/client/v1.0/app/${clientAppID}` :
        `${baseUrl}/api/public/v1.0`)
    },
    [v2]: {
      [API_TYPE_PUBLIC]: `${baseUrl}/api/public/v2.0`,
      [API_TYPE_CLIENT]: `${baseUrl}/api/client/v2.0`,
      [API_TYPE_PRIVATE]: `${baseUrl}/api/private/v2.0`,
      [API_TYPE_APP]: (clientAppID ?
        `${baseUrl}/api/client/v2.0/app/${clientAppID}` :
        `${baseUrl}/api/public/v2.0`)
    },
    [v3]: {
      [API_TYPE_PUBLIC]: `${baseUrl}/api/public/v3.0`,
      [API_TYPE_CLIENT]: `${baseUrl}/api/client/v3.0`,
      [API_TYPE_APP]: (clientAppID ?
        `${baseUrl}/api/client/v3.0/app/${clientAppID}` :
        `${baseUrl}/api/admin/v3.0`)
    }
  };

  const authOptions = {
    codec: APP_CLIENT_CODEC,
    storage: options.storage
  };

  if (options.storageType) {
    authOptions.storageType = options.storageType;
  }
  if (options.platform) {
    authOptions.platform = options.platform;
  }
  if (options.authCodec) {
    authOptions.codec = options.authCodec;
  }

  const authPromise = AuthFactory.create(stitchClient, stitchClient.authUrl, authOptions);
  return authPromise.then(auth => {
    stitchClient.auth = auth;
    return Promise.all([
      stitchClient.auth.handleRedirect(),
      stitchClient.auth.handleCookie()
    ]);
  }).then(() => stitchClient);
}
/**
 * Prototype for StitchClient class.
 * This is the internal implementation for StitchClient and should not
 * be exposed.
 *
 * @class
 */
export class StitchClient {
  constructor() {
    throw new StitchError('StitchClient can only be made from the StitchClientFactory.create function');
  }

  get type() {
    return common.APP_CLIENT_TYPE;
  }

  /**
   * Login to stitch instance, optionally providing a username and password. In
   * the event that these are omitted, anonymous authentication is used.
   *
   * @param {String} [email] the email address used for login
   * @param {String} [password] the password for the provided email address
   * @param {Object} [options] additional authentication options
   * @returns {Promise}
   */
  login(email, password, options = {}) {
    if (email === undefined || password === undefined) {
      return this.authenticate(PROVIDER_TYPE_ANON, options);
    }

    return this.authenticate('userpass', Object.assign({ username: email, password }, options));
  }

  /**
   * Send a request to the server indicating the provided email would like
   * to sign up for an account. This will trigger a confirmation email containing
   * a token which must be used with the `emailConfirm` method of the `userpass`
   * auth provider in order to complete registration. The user will not be able
   * to log in until that flow has been completed.
   *
   * @param {String} email the email used to sign up for the app
   * @param {String} password the password used to sign up for the app
   * @param {Object} [options] additional authentication options
   * @returns {Promise}
   */
  register(email, password, options = {}) {
    return this.auth.provider('userpass').register(email, password, options);
  }

  /**
   * Submits an authentication request to the specified provider providing any
   * included options (read: user data).  If auth data already exists and the
   * existing auth data has an access token, then these credentials are returned.
   *
   * @param {String} providerType the provider used for authentication (e.g. 'userpass', 'facebook', 'google')
   * @param {Object} [options] additional authentication options
   * @returns {Promise} which resolves to a String value: the authed userId
   */
  authenticate(providerType, options = {}) {
    // reuse existing auth if present
    const authenticateFn = () =>
      this.auth.provider(providerType).authenticate(options).then(() => this.authedId());

    if (this.isAuthenticated()) {
      if (providerType === PROVIDER_TYPE_ANON && this.auth.getLoggedInProviderType() === PROVIDER_TYPE_ANON) {
        return Promise.resolve(this.auth.authedId); // is authenticated, skip log in
      }

      return this.logout().then(() => authenticateFn()); // will not be authenticated, continue log in
    }

    // is not authenticated, continue log in
    return authenticateFn();
  }

  /**
   * Ends the session for the current user.
   *
   * @returns {Promise}
   */
  logout() {
    return this._do(
      '/auth/session',
      'DELETE',
      {
        refreshOnFailure: false,
        useRefreshToken: true,
        rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT]
      }
    ).then(() => this.auth.clear(), () => this.auth.clear());
  }

  /**
   * @return {*} Returns any error from the Stitch authentication system.
   */
  authError() {
    return this.auth.error();
  }

  /**
   * Returns profile information for the currently logged in user
   *
   * @returns {Promise}
   */
  userProfile() {
    return this._do(
      '/auth/profile',
      'GET',
      {rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT]},
    ).then(response => response.json());
  }

  /**
  * @return {Boolean} whether or not the current client is authenticated
  */
  isAuthenticated() {
    return !!this.authedId();
  }

  /**
   *  @return {String} Returns a string of the currently authed user's ID.
   */
  authedId() {
    return this.auth.authedId;
  }

  /**
   * Factory method for accessing Stitch services.
   *
   * @method
   * @param {String} type The service type [mongodb, {String}]
   * @param {String} name The service name.
   * @return {Object} returns a named service.
   */
  service(type, name) {
    if (this.constructor !== StitchClient) {
      throw new StitchError('`service` is a factory method, do not use `new`');
    }

    if (!ServiceRegistry.hasOwnProperty(type)) {
      throw new StitchError('Invalid service type specified: ' + type);
    }

    const ServiceType = ServiceRegistry[type];
    return new ServiceType(this, name);
  }

  /**
   * Executes a function.
   *
   * @param {String} name The name of the function.
   * @param {...*} args Arguments to pass to the function.
   */
  executeFunction(name, ...args) {
    return this._doFunctionCall({
      name,
      arguments: args
    });
  }

  /**
   * Executes a service function.
   *
   * @param {String} service The name of the service.
   * @param {String} action The name of the service action.
   * @param {...*} args Arguments to pass to the service action.
   */
  executeServiceFunction(service, action, ...args) {
    return this._doFunctionCall({
      service,
      name: action,
      arguments: args
    });
  }

  _doFunctionCall(request) {
    let responseDecoder = (d) => ExtJSON.parse(d, { strict: false });
    let responseEncoder = (d) => ExtJSON.stringify(d);

    return this._do('/functions/call', 'POST', { body: responseEncoder(request) })
      .then(response => response.text())
      .then(body => responseDecoder(body));
  }

  /**
   * Returns an access token for the user
   *
   * @returns {Promise}
   */
  doSessionPost() {
    return this._do(
      '/auth/session',
      'POST',
      {
        refreshOnFailure: false,
        useRefreshToken: true,
        rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT]
      }
    )
      .then(response => response.json());
  }

  /**
   * Returns an array of api keys
   *
   * @returns {Promise}
   */
  getApiKeys() {
    return this._do(
      '/auth/api_keys',
      'GET',
      {
        rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT],
        useRefreshToken: true
      },
    )
      .then((response) => response.json());
  }

  /**
   * Creates a user api key
   *
   * @param {String} userApiKeyName the user defined name of the userApiKey
   * @returns {Promise}
   */
  createApiKey(userApiKeyName) {
    return this._do(
      '/auth/api_keys',
      'POST',
      { rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT],
        useRefreshToken: true,
        body: JSON.stringify({'name': userApiKeyName})
      },
    )
      .then((response) => response.json());
  }

  /**
   * Returns a user api key
   *
   * @param {String} keyID the ID of the key
   * @returns {Promise}
   */
  getApiKeyByID(keyID) {
    return this._do(
      `/auth/api_keys/${keyID}`,
      'GET',
      {
        rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT],
        useRefreshToken: true
      },
    )
      .then((response) => response.json());
  }

  /**
   * Deletes a user api key
   *
   * @param {String} keyID the ID of the key
   * @returns {Promise}
   */
  deleteApiKeyByID(keyID) {
    return this._do(
      `/auth/api_keys/${keyID}`,
      'DELETE',
      {
        rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT],
        useRefreshToken: true
      },
    );
  }

  /**
   * Enable a user api key
   *
   * @param {String} keyID the ID of the key
   * @returns {Promise}
   */
  enableApiKeyByID(keyID) {
    return this._do(
      `/auth/api_keys/${keyID}/enable`,
      'PUT',
      {
        rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT],
        useRefreshToken: true
      },
    );
  }

  /**
   * Disable a user api key
   *
   * @param {String} keyID the ID of the key
   * @returns {Promise}
   */
  disableApiKeyByID(keyID) {
    return this._do(
      `/auth/api_keys/${keyID}/disable`,
      'PUT',
      {
        rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT],
        useRefreshToken: true
      },
    );
  }

  _fetch(url, fetchArgs, resource, method, options) {
    return fetch(url, fetchArgs)
      .then(response => {
        // Okay: passthrough
        if (response.status >= 200 && response.status < 300) {
          return Promise.resolve(response);
        }

        if (response.headers.get('Content-Type') === common.JSONTYPE) {
          return response.json()
            .then(json => {
              // Only want to try refreshing token when there's an invalid session
              if ('error_code' in json && json.error_code === ErrInvalidSession) {
                if (!options.refreshOnFailure) {
                  return this.auth.clear().then(() => {
                    const error = new StitchError(json.error, json.error_code);
                    error.response = response;
                    error.json = json;
                    throw error;
                  });
                }

                return this.auth.refreshToken()
                  .then(() => {
                    options.refreshOnFailure = false;
                    return this._do(resource, method, options);
                  });
              }

              const error = new StitchError(json.error, json.error_code);
              error.response = response;
              error.json = json;
              return Promise.reject(error);
            });
        }

        const error = new Error(response.statusText);
        error.response = response;
        return Promise.reject(error);
      });
  }

  _fetchArgs(resource, method, options) {
    const appURL = this.rootURLsByAPIVersion[options.apiVersion][options.apiType];
    let url = `${appURL}${resource}`;
    if (options.rootURL) {
      url = `${options.rootURL}${resource}`;
    }
    let fetchArgs = common.makeFetchArgs(method, options.body);

    if (!!options.headers) {
      Object.assign(fetchArgs.headers, options.headers);
    }

    if (options.queryParams) {
      url = `${url}?${queryString.stringify(options.queryParams)}`;
    }

    return { url, fetchArgs };
  }

  _do(resource, method, options) {
    options = Object.assign({}, {
      refreshOnFailure: true,
      useRefreshToken: false,
      apiVersion: v2,
      apiType: API_TYPE_APP,
      rootURL: undefined
    }, options);

    let { url, fetchArgs } = this._fetchArgs(resource, method, options);
    if (options.noAuth) {
      return this._fetch(url, fetchArgs, resource, method, options);
    }

    if (!this.isAuthenticated()) {
      return Promise.reject(new StitchError('Must auth first', ErrUnauthorized));
    }
    const token =
      options.useRefreshToken ? this.auth.getRefreshToken() : this.auth.getAccessToken();

    // If access token is expired, proactively get a new one
    if (!options.useRefreshToken) {
      if (this.auth.isAccessTokenExpired()) {
        return this.auth.refreshToken().then(() => {
          options.refreshOnFailure = false;
          return this._do(resource, method, options);
        });
      }

      fetchArgs.headers.Authorization = `Bearer ${token}`;
      return this._fetch(url, fetchArgs, resource, method, options);
    }

    fetchArgs.headers.Authorization = `Bearer ${token}`;
    return this._fetch(url, fetchArgs, resource, method, options);
  }
}
