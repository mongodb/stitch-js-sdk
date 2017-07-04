/* global window, fetch */
/* eslint no-labels: ['error', { 'allowLoop': true }] */
import 'fetch-everywhere';
import Auth from './auth';
import ServiceRegistry from './services';
import * as common from './common';
import ExtJSONModule from 'mongodb-extjson';
import queryString from 'query-string';
import { deprecate } from './util';
import {
  StitchError,
  ErrInvalidSession,
  ErrUnauthorized
} from './errors';

const EJSON = new ExtJSONModule();

/**
 * Create a new StitchClient instance.
 *
 * @class
 * @return {StitchClient} a StitchClient instance.
 */
class StitchClient {
  constructor(clientAppID, options) {
    let baseUrl = common.DEFAULT_STITCH_SERVER_URL;
    if (options && options.baseUrl) {
      baseUrl = options.baseUrl;
    }

    this.appUrl = `${baseUrl}/api/public/v1.0`;
    this.authUrl = `${baseUrl}/api/public/v1.0/auth`;
    if (clientAppID) {
      this.appUrl = `${baseUrl}/api/client/v1.0/app/${clientAppID}`;
      this.authUrl = `${this.appUrl}/auth`;
    }

    this.auth = new Auth(this, this.authUrl);
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

  /**
   * Login to stich instance, optionally providing a username and password. In
   * the event that these are omitted, anonymous authentication is used.
   *
   * @param {String} [email] the email address used for login
   * @param {String} [password] the password for the provided email address
   * @param {Object} [options] additional authentication options
   * @returns {Promise}
   */
  login(email, password, options = {}) {
    if (email === undefined || password === undefined) {
      return this.auth.provider('anon').login(options);
    }

    return this.auth.provider('userpass').login(email, password, options);
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
   * Starts an OAuth authorization flow by opening a popup window
   *
   * @param {String} providerType the provider used for authentication (e.g. 'facebook', 'google')
   * @param {Object} [options] additional authentication options (user data)
   * @returns {Promise}
   */
  authenticate(providerType, options) {
    return this.auth.provider(providerType).authenticate(options);
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
    const namedPipelineVar = 'namedPipelineOutput';
    const namedPipelineStages = [
      {
        action: 'literal',
        args: {
          items: [ `%%vars.${namedPipelineVar}` ]
        },
        let: {
          [namedPipelineVar]: {
            '%pipeline': { name, args }
          }
        }
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

    return this._do('/pipeline', 'POST', { body: responseEncoder(stages) })
      .then(response => response.text())
      .then(body => responseDecoder(body));
  }

  _do(resource, method, options) {
    options = Object.assign({}, {
      refreshOnFailure: true,
      useRefreshToken: false
    }, options);

    if (!options.noAuth) {
      if (!this.authedId()) {
        return Promise.reject(new StitchError('Must auth first', ErrUnauthorized));
      }
    }

    let url = `${this.appUrl}${resource}`;
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
    return this.login();
  }
}

StitchClient.prototype.authWithOAuth =
  deprecate(StitchClient.prototype.authWithOAuth, 'use `authenticate` instead of `authWithOAuth`');
StitchClient.prototype.anonymousAuth =
  deprecate(StitchClient.prototype.anonymousAuth, 'use `login()` instead of `anonymousAuth`');

class Admin {
  constructor(baseUrl) {
    this.client = new StitchClient('', {baseUrl});
  }

  _do(url, method, options) {
    return this.client._do(url, method, options)
      .then(response => response.json());
  }

  _get(url, queryParams) {
    return this._do(url, 'GET', {queryParams});
  }

  _put(url, options) {
    return this._do(url, 'PUT', options);
  }

  _delete(url) {
    return this._do(url, 'DELETE');
  }

  _post(url, body) {
    return this._do(url, 'POST', {body: JSON.stringify(body)});
  }

  profile() {
    let root = this;
    return {
      keys: () => ({
        list: () => root._get('/profile/keys'),
        create: (key) => root._post('/profile/keys'),
        apiKey: (keyId) => ({
          get: () => root._get(`/profile/keys/${keyId}`),
          remove: () => this._delete(`/profile/keys/${keyId}`),
          enable: () => root._put(`/profile/keys/${keyId}/enable`),
          disable: () => root._put(`/profile/keys/${keyId}/disable`)
        })
      })
    };
  }

  /* Examples of how to access admin API with this client:
   *
   * List all apps
   *    a.apps('580e6d055b199c221fcb821c').list()
   *
   * Fetch app under name 'planner'
   *    a.apps('580e6d055b199c221fcb821c').app('planner').get()
   *
   * List services under the app 'planner'
   *    a.apps('580e6d055b199c221fcb821c').app('planner').services().list()
   *
   * Delete a rule by ID
   *    a.apps('580e6d055b199c221fcb821c').app('planner').services().service('mdb1').rules().rule('580e6d055b199c221fcb821d').remove()
   *
   */
  apps(groupId) {
    let root = this;
    return {
      list: () => root._get(`/groups/${groupId}/apps`),
      create: (data, options) => {
        let query = (options && options.defaults) ? '?defaults=true' : '';
        return root._post(`/groups/${groupId}/apps` + query, data);
      },

      app: (appID) => ({
        get: () => root._get(`/groups/${groupId}/apps/${appID}`),
        remove: () => root._delete(`/groups/${groupId}/apps/${appID}`),
        replace: (doc) => root._put(`/groups/${groupId}/apps/${appID}`, {
          headers: { 'X-Stitch-Unsafe': appID },
          body: JSON.stringify(doc)
        }),

        messages: () => ({
          list: (filter) =>  this._get(`/groups/${groupId}/apps/${appID}/push/messages`, filter),
          create: (msg) =>  this._put(`/groups/${groupId}/apps/${appID}/push/messages`,  {body: JSON.stringify(msg)}),
          message: (id) => ({
            get: () => this._get(`/groups/${groupId}/apps/${appID}/push/messages/${id}`),
            remove: () => this._delete(`/groups/${groupId}/apps/${appID}/push/messages/${id}`),
            setSaveType: type => this._post(`/groups/${groupId}/apps/${appID}/push/messages/${id}`, {type}),
            update: msg => this._put(`/groups/${groupId}/apps/${appID}/push/messages/${id}`, {body: JSON.stringify(msg)})
          })
        }),

        users: () => ({
          list: (filter) => this._get(`/groups/${groupId}/apps/${appID}/users`, filter),
          create: (user) => this._post(`/groups/${groupId}/apps/${appID}/users`, user),
          user: (uid) => ({
            get: () => this._get(`/groups/${groupId}/apps/${appID}/users/${uid}`),
            logout: () => this._put(`/groups/${groupId}/apps/${appID}/users/${uid}/logout`)
          })
        }),

        sandbox: () => ({
          executePipeline: (data, userId, options) => {
            const queryParams = Object.assign({}, options, {user_id: userId});
            return this._do(
              `/groups/${groupId}/apps/${appID}/sandbox/pipeline`,
              'POST',
              {body: JSON.stringify(data), queryParams});
          }
        }),

        authProviders: () => ({
          create: (data) => this._post(`/groups/${groupId}/apps/${appID}/authProviders`, data),
          list: () => this._get(`/groups/${groupId}/apps/${appID}/authProviders`),
          provider: (authType, authName) => ({
            get: () => this._get(`/groups/${groupId}/apps/${appID}/authProviders/${authType}/${authName}`),
            remove: () => this._delete(`/groups/${groupId}/apps/${appID}/authProviders/${authType}/${authName}`),
            update: (data) => this._post(`/groups/${groupId}/apps/${appID}/authProviders/${authType}/${authName}`, data)
          })
        }),
        security: () => ({
          allowedRequestOrigins: () => ({
            get: () => this._get(`/groups/${groupId}/apps/${appID}/security/allowedRequestOrigins`),
            update: (data) => this._post(`/groups/${groupId}/apps/${appID}/security/allowedRequestOrigins`, data)
          })
        }),
        values: () => ({
          list: () => this._get(`/groups/${groupId}/apps/${appID}/values`),
          value: (varName) => ({
            get: () => this._get(`/groups/${groupId}/apps/${appID}/values/${varName}`),
            remove: () => this._delete(`/groups/${groupId}/apps/${appID}/values/${varName}`),
            create: (data) => this._post(`/groups/${groupId}/apps/${appID}/values/${varName}`, data),
            update: (data) => this._post(`/groups/${groupId}/apps/${appID}/values/${varName}`, data)
          })
        }),
        pipelines: () => ({
          list: () => this._get(`/groups/${groupId}/apps/${appID}/pipelines`),
          pipeline: (varName) => ({
            get: () => this._get(`/groups/${groupId}/apps/${appID}/pipelines/${varName}`),
            remove: () => this._delete(`/groups/${groupId}/apps/${appID}/pipelines/${varName}`),
            create: (data) => this._post(`/groups/${groupId}/apps/${appID}/pipelines/${varName}`, data),
            update: (data) => this._post(`/groups/${groupId}/apps/${appID}/pipelines/${varName}`, data)
          })
        }),
        logs: () => ({
          get: (filter) => this._get(`/groups/${groupId}/apps/${appID}/logs`, filter)
        }),
        apiKeys: () => ({
          list: () => this._get(`/groups/${groupId}/apps/${appID}/keys`),
          create: (data) => this._post(`/groups/${groupId}/apps/${appID}/keys`, data),
          apiKey: (key) => ({
            get: () => this._get(`/groups/${groupId}/apps/${appID}/keys/${key}`),
            remove: () => this._delete(`/groups/${groupId}/apps/${appID}/keys/${key}`),
            enable: () => this._put(`/groups/${groupId}/apps/${appID}/keys/${key}/enable`),
            disable: () => this._put(`/groups/${groupId}/apps/${appID}/keys/${key}/disable`)
          })
        }),
        services: () => ({
          list: () => this._get(`/groups/${groupId}/apps/${appID}/services`),
          create: (data) => this._post(`/groups/${groupId}/apps/${appID}/services`, data),
          service: (svc) => ({
            get: () => this._get(`/groups/${groupId}/apps/${appID}/services/${svc}`),
            update: (data) => this._post(`/groups/${groupId}/apps/${appID}/services/${svc}`, data),
            remove: () => this._delete(`/groups/${groupId}/apps/${appID}/services/${svc}`),
            setConfig: (data) => this._post(`/groups/${groupId}/apps/${appID}/services/${svc}/config`, data),

            rules: () => ({
              list: () => this._get(`/groups/${groupId}/apps/${appID}/services/${svc}/rules`),
              create: (data) => this._post(`/groups/${groupId}/apps/${appID}/services/${svc}/rules`),
              rule: (ruleId) => ({
                get: () => this._get(`/groups/${groupId}/apps/${appID}/services/${svc}/rules/${ruleId}`),
                update: (data) => this._post(`/groups/${groupId}/apps/${appID}/services/${svc}/rules/${ruleId}`, data),
                remove: () => this._delete(`/groups/${groupId}/apps/${appID}/services/${svc}/rules/${ruleId}`)
              })
            }),

            incomingWebhooks: () => ({
              list: () => this._get(`/groups/${groupId}/apps/${appID}/services/${svc}/incomingWebhooks`),
              create: (data) => this._post(`/groups/${groupId}/apps/${appID}/services/${svc}/incomingWebhooks`, data),
              incomingWebhook: (incomingWebhookId) => ({
                get: () => this._get(`/groups/${groupId}/apps/${appID}/services/${svc}/incomingWebhooks/${incomingWebhookId}`),
                update: (data) => this._post(`/groups/${groupId}/apps/${appID}/services/${svc}/incomingWebhooks/${incomingWebhookId}`, data),
                remove: () => this._delete(`/groups/${groupId}/apps/${appID}/services/${svc}/incomingWebhooks/${incomingWebhookId}`)
              })
            })
          })
        })
      })
    };
  }

  _admin() {
    return {
      logs: () => ({
        get: (filter) => this._do('/admin/logs', 'GET', { useRefreshToken: true, queryParams: filter })
      }),
      users: () => ({
        list: (filter) => this._do('/admin/users', 'GET', { useRefreshToken: true, queryParams: filter }),
        user: (uid) => ({
          logout: () => this._do(`/admin/users/${uid}/logout`, 'PUT', { useRefreshToken: true })
        })
      })
    };
  }

  _isImpersonatingUser() {
    return this.client.auth.isImpersonatingUser();
  }

  _startImpersonation(userId) {
    return this.client.auth.startImpersonation(this.client, userId);
  }

  _stopImpersonation() {
    return this.client.auth.stopImpersonation();
  }
}

export {
  StitchClient,
  Admin
};
