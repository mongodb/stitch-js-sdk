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
  * StitchClientFactory is a singleton factory class which can be used to
  * asynchronously create instances of {@link StitchClient}. StitchClientFactory
  * is not meant to be instantiated. Use the static `create()` method to build
  * a new StitchClient.
  */
export class StitchClientFactory {
  /**
   * @hideconstructor
   */
  constructor() {
    throw new StitchError('StitchClient can only be made from the StitchClientFactory.create function');
  }

  /**
   * Creates a new {@link StitchClient}.
   *
   * @param {String} clientAppID the app ID of the Stitch application, which can be found in
   * the "Clients" page of the Stitch admin console.
   * @param {Object} [options = {}] additional options for creating the {@link StitchClient}.
   */
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
 * StitchClient is the fundamental way of communicating with MongoDB Stitch in your
 * application. Use StitchClient to authenticate users and to access Stitch services.
 * StitchClient is not meant to be instantiated directly. Use a
 * {@link StitchClientFactory} to create one.
 */
export class StitchClient {
  /**
   * @hideconstructor
   */
  constructor() {
    let classname = this.constructor.name;
    throw new StitchError(`${classname} can only be made from the ${classname}Factory.create function`);
  }

  get type() {
    return common.APP_CLIENT_TYPE;
  }

  /**
   * Login to Stitch instance, optionally providing a username and password. In
   * the event that these are omitted, anonymous authentication is used.
   *
   * @param {String} [email] the email address used for login
   * @param {String} [password] the password for the provided email address
   * @param {Object} [options = {}] additional authentication options
   * @returns {Promise} which resolve to a String value: the authenticated user ID.
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
   * @param {Object} [options = {}] additional authentication options
   * @returns {Promise}
   */
  register(email, password, options = {}) {
    return this.auth.provider('userpass').register(email, password, options);
  }


  /**
   * Links the currently logged in user with another identity.
   *
   * @param {String} providerType the provider of the other identity (e.g. 'userpass', 'facebook', 'google')
   * @param {Object} [options = {}] additional authentication options
   * @returns {Promise} which resolves to a String value: the original user ID
   */
  linkWithProvider(providerType, options = {}) {
    if (!this.isAuthenticated()) {
      throw new StitchError('Must be authenticated to link an account');
    }

    return this.auth.provider(providerType).authenticate(options, true).then(() => this.authedId());
  }

  /**
   * Submits an authentication request to the specified provider providing any
   * included options (read: user data).  If auth data already exists and the
   * existing auth data has an access token, then these credentials are returned.
   *
   * @param {String} providerType the provider used for authentication (The possible
   *                 options are 'anon', 'userpass', 'custom', 'facebook', 'google',
   *                 and 'apiKey')
   * @param {Object} [options = {}] additional authentication options
   * @returns {Promise} which resolves to a String value: the authenticated user ID
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
   * Ends the session for the current user, and clears auth information from storage.
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
   * @returns {*} Returns any error from the Stitch authentication system.
   */
  authError() {
    return this.auth.error();
  }

  /**
   * Returns profile information for the currently logged in user.
   *
   * @returns {Promise} which resolves to a a JSON object containing user profile information.
   */
  userProfile() {
    return this._do(
      '/auth/profile',
      'GET',
      {rootURL: this.rootURLsByAPIVersion[v2][API_TYPE_CLIENT]},
    ).then(response => response.json());
  }

  /**
  * @returns {Boolean} whether or not the current client is authenticated.
  */
  isAuthenticated() {
    return !!this.authedId();
  }

  /**
   *  @returns {String} a string of the currently authenticated user's ID.
   */
  authedId() {
    return this.auth.authedId;
  }

  /**
   * Factory method for accessing Stitch services.
   *
   * @method
   * @param {String} type the service type (e.g. "mongodb", "aws-s3", "aws-ses", "twilio", "http", etc.)
   * @param {String} name the service name specified in the Stitch admin console.
   * @returns {Object} returns an instance of the specified service type.
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
   * @private
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
   * Returns the user API keys associated with the current user.
   *
   * @returns {Promise} which resolves to an array of API key objects
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
   * Creates a user API key that can be used to authenticate as the current user.
   *
   * @param {String} userApiKeyName a unique name for the user API key
   * @returns {Promise} which resolves to an API key object containing the API key value
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
   * Returns a user API key associated with the current user.
   *
   * @param {String} keyID the ID of the key to fetch
   * @returns {Promise} which resolves to an API key object, although the API key value will be omitted
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
   * Deletes a user API key associated with the current user.
   *
   * @param {String} keyID the ID of the key to delete
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
   * Enables a user API key associated with the current user.
   *
   * @param {String} keyID the ID of the key to enable
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
   * Disables a user API key associated with the current user.
   *
   * @param {String} keyID the ID of the key to disable
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

    fetchArgs.headers.Authorization = `Bearer ${token}`;
    return this._fetch(url, fetchArgs, resource, method, options);
  }
}
