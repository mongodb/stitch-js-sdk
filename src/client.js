/* global window, fetch */
/* eslint no-labels: ['error', { 'allowLoop': true }] */
import 'fetch-everywhere';
import Auth from './auth';
import { APP_CLIENT_CODEC } from './auth/common';
import ServiceRegistry from './services';
import * as common from './common';
import ExtJSONModule from 'mongodb-extjson';
import queryString from 'query-string';
import { deprecate, collectMetadata } from './util';
import {
  StitchError,
  ErrInvalidSession,
  ErrUnauthorized
} from './errors';

const EJSON = new ExtJSONModule();

const v1 = 1;
const v2 = 2;

/**
 * Create a new StitchClient instance.
 *
 * @class
 * @return {StitchClient} a StitchClient instance.
 */
export default class StitchClient {
  constructor(clientAppID, options) {
    let baseUrl = common.DEFAULT_STITCH_SERVER_URL;
    if (options && options.baseUrl) {
      baseUrl = options.baseUrl;
    }

    this.clientAppID = clientAppID;

    this.authUrl = (
      clientAppID ?
        `${baseUrl}/api/client/v1.0/app/${clientAppID}/auth` :
        `${baseUrl}/api/public/v2.0/auth`
    );

    this.rootURLsByAPIVersion = {
      [v1]: {
        public: `${baseUrl}/api/public/v1.0`,
        client: `${baseUrl}/api/client/v1.0`,
        private: `${baseUrl}/api/private/v1.0`,
        app: (clientAppID ?
              `${baseUrl}/api/client/v1.0/app/${clientAppID}` :
              `${baseUrl}/api/public/v1.0`)
      },
      [v2]: {
        public: `${baseUrl}/api/public/v2.0`,
        client: `${baseUrl}/api/client/v2.0`,
        private: `${baseUrl}/api/private/v2.0`,
        app: (clientAppID ?
              `${baseUrl}/api/client/v2.0/app/${clientAppID}` :
              `${baseUrl}/api/public/v2.0`)
      }
    };

    const authOptions = {codec: APP_CLIENT_CODEC};
    if (options && options.authCodec) {
      authOptions.codec = options.authCodec;
    }
    this.auth = new Auth(this, this.authUrl, authOptions);
    this.auth.handleRedirect();
    this.auth.handleCookie();

    // deprecated API
    this.authManager = {
      apiKeyAuth: (key) => this.authenticate('apiKey', key),
      localAuth: (email, password) => this.login(email, password),
      mongodbCloudAuth: (username, apiKey, opts) =>
        this.authenticate('mongodbCloud', Object.assign({ username, apiKey }, opts))
    };

    this.authManager.apiKeyAuth =
      deprecate(this.authManager.apiKeyAuth, 'use `client.authenticate("apiKey", "key")` instead of `client.authManager.apiKey`');
    this.authManager.localAuth =
      deprecate(this.authManager.localAuth, 'use `client.login` instead of `client.authManager.localAuth`');
    this.authManager.mongodbCloudAuth =
      deprecate(this.authManager.mongodbCloudAuth, 'use `client.authenticate("mongodbCloud", opts)` instead of `client.authManager.mongodbCloudAuth`');
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
      return this.authenticate('anon', options);
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
    if (this.auth.getAccessToken()) {
      return Promise.resolve(this.auth.authedId());
    }

    return this.auth.provider(providerType).authenticate(options)
      .then(() => this.auth.authedId());
  }

  /**
   * Ends the session for the current user.
   *
   * @returns {Promise}
   */
  logout() {
    return this._do('/auth', 'DELETE', { refreshOnFailure: false, useRefreshToken: true })
      .then(() => this.auth.clear());
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
    return this._do('/auth/me', 'GET')
      .then(response => response.json());
  }
  /**
   *  @return {String} Returns the currently authed user's ID.
   */
  authedId() {
    return this.auth.authedId();
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
   * Executes a named pipeline.
   *
   * @param {String} name Name of the named pipeline to execute.
   * @param {Object} args Arguments to the named pipeline to execute.
   * @param {Object} [options] Additional options to pass to the execution context.
   */
  executeNamedPipeline(name, args, options = {}) {
    const namedPipelineStages = [
      {
        service: '',
        action: 'namedPipeline',
        args: { name, args }
      }
    ];
    return this.executePipeline(namedPipelineStages, options);
  }

  /**
   * Executes a service pipeline.
   *
   * @param {Array} stages Stages to process.
   * @param {Object} [options] Additional options to pass to the execution context.
   */
  executePipeline(stages, options = {}) {
    let responseDecoder = (d) => EJSON.parse(d, { strict: false });
    let responseEncoder = (d) => EJSON.stringify(d);
    stages = Array.isArray(stages) ? stages : [ stages ];
    stages = stages.reduce((acc, stage) => acc.concat(stage), []);

    if (options.decoder) {
      if ((typeof options.decoder) !== 'function') {
        throw new Error('decoder option must be a function, but "' + typeof (options.decoder) + '" was provided');
      }
      responseDecoder = options.decoder;
    }

    if (options.encoder) {
      if ((typeof options.encoder) !== 'function') {
        throw new Error('encoder option must be a function, but "' + typeof (options.encoder) + '" was provided');
      }
      responseEncoder = options.encoder;
    }
    if (options.finalizer && typeof options.finalizer !== 'function') {
      throw new Error('finalizer option must be a function, but "' + typeof (options.finalizer) + '" was provided');
    }

    return this._do('/pipeline', 'POST', { body: responseEncoder(stages) })
      .then(response => response.text())
      .then(body => responseDecoder(body))
      .then(collectMetadata(options.finalizer));
  }

  /**
   * Returns an access token for the user
   *
   * @returns {Promise}
   */

  doSessionPost() {
    return this._do('/auth/newAccessToken', 'POST', { refreshOnFailure: false, useRefreshToken: true })
      .then(response => response.json());
  }

  _do(resource, method, options) {
    options = Object.assign({}, {
      refreshOnFailure: true,
      useRefreshToken: false,
      apiVersion: v1,
      apiType: 'app'
    }, options);

    if (!options.noAuth) {
      if (!this.authedId()) {
        return Promise.reject(new StitchError('Must auth first', ErrUnauthorized));
      }

      // If access token is expired, proactively get a new one
      if (!options.useRefreshToken && this.auth.isAccessTokenExpired()) {
        return this.auth.refreshToken().then(() => {
          options.refreshOnFailure = false;
          return this._do(resource, method, options);
        });
      }
    }

    const appURL = this.rootURLsByAPIVersion[options.apiVersion][options.apiType];
    let url = `${appURL}${resource}`;
    let fetchArgs = common.makeFetchArgs(method, options.body);

    if (!!options.headers) {
      Object.assign(fetchArgs.headers, options.headers);
    }

    if (!options.noAuth) {
      let token =
        options.useRefreshToken ? this.auth.getRefreshToken() : this.auth.getAccessToken();
      fetchArgs.headers.Authorization = `Bearer ${token}`;
    }

    if (options.queryParams) {
      url = `${url}?${queryString.stringify(options.queryParams)}`;
    }

    return fetch(url, fetchArgs)
      .then((response) => {
        // Okay: passthrough
        if (response.status >= 200 && response.status < 300) {
          return Promise.resolve(response);
        }

        if (response.headers.get('Content-Type') === common.JSONTYPE) {
          return response.json()
            .then((json) => {
              // Only want to try refreshing token when there's an invalid session
              if ('errorCode' in json && json.errorCode === ErrInvalidSession) {
                if (!options.refreshOnFailure) {
                  this.auth.clear();
                  const error = new StitchError(json.error, json.errorCode);
                  error.response = response;
                  error.json = json;
                  throw error;
                }

                return this.auth.refreshToken()
                  .then(() => {
                    options.refreshOnFailure = false;
                    return this._do(resource, method, options);
                  });
              }

              const error = new StitchError(json.error, json.errorCode);
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

  // Deprecated API
  authWithOAuth(providerType, redirectUrl) {
    return this.auth.provider(providerType).authenticate({ redirectUrl });
  }

  anonymousAuth() {
    return this.authenticate('anon');
  }
}

StitchClient.prototype.authWithOAuth =
  deprecate(StitchClient.prototype.authWithOAuth, 'use `authenticate` instead of `authWithOAuth`');
StitchClient.prototype.anonymousAuth =
  deprecate(StitchClient.prototype.anonymousAuth, 'use `login()` instead of `anonymousAuth`');
