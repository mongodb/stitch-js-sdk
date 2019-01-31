/* global window, fetch */
/* eslint no-labels: ['error', { 'allowLoop': true }] */
import 'fetch-everywhere';
import FormData from 'form-data';
import { newStitchClient, StitchClient } from './client';
import ADMIN_CLIENT_TYPE from './common';
import { ADMIN_CLIENT_CODEC } from './auth/common';
import { StitchError } from './errors';

const v3 = 3;

/** @private **/
export class StitchAdminClientFactory {
  constructor() {
    throw new StitchError('StitchAdminClient can only be made from the StitchAdminClientFactory.create function');
  }

  static create(baseUrl) {
    return newStitchClient(StitchAdminClient.prototype, '', {baseUrl, authCodec: ADMIN_CLIENT_CODEC});
  }
}

/** @private */
export class StitchAdminClient extends StitchClient {
  constructor() {
    super();
  }

  get type() {
    return ADMIN_CLIENT_TYPE;
  }

  get _v3() {
    const v3do = (url, method, options) =>
      super._do(
        url,
        method,
        Object.assign({}, { apiVersion: v3 }, options)
      ).then(response => {
        const contentHeader = response.headers.get('content-type') || '';
        if (contentHeader.split(',').indexOf('application/json') >= 0) {
          return response.json();
        }
        return response;
      });

    return {
      _get: (url, queryParams, headers) => v3do(url, 'GET', {queryParams, headers}),
      _put: (url, options) =>
        (options ?
          v3do(url, 'PUT', options) :
          v3do(url, 'PUT')),
      _patch: (url, options) =>
        (options ?
          v3do(url, 'PATCH', options) :
          v3do(url, 'PATCH')),
      _delete: (url, queryParams)  =>
        (queryParams ?
          v3do(url, 'DELETE', {queryParams}) :
          v3do(url, 'DELETE')),
      _post: (url, body, queryParams) =>
        (queryParams ?
          v3do(url, 'POST', { body: JSON.stringify(body), queryParams }) :
          v3do(url, 'POST', { body: JSON.stringify(body) }))
    };
  }

  /**
   * Ends the session for the current user.
   *
   * @returns {Promise}
   */
  logout() {
    return super._do('/auth/session', 'DELETE', { refreshOnFailure: false, useRefreshToken: true, apiVersion: v3 })
      .then(() => this.auth.clear());
  }

  /**
   * Returns profile information for the currently logged in user
   *
   * @returns {Promise}
   */
  userProfile() {
    return this._v3._get('/auth/profile');
  }

  /**
   * Returns available providers for the currently logged in admin
   *
   * @returns {Promise}
   */
  getAuthProviders() {
    return super._do('/auth/providers', 'GET', { noAuth: true, apiVersion: v3 })
      .then(response => response.json());
  }

  /**
   * Returns an access token for the user
   *
   * @returns {Promise}
   */
  doSessionPost() {
    return super._do('/auth/session', 'POST', { refreshOnFailure: false, useRefreshToken: true, apiVersion: v3 })
      .then(response => response.json());
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
    const api = this._v3;
    const groupUrl = `/groups/${groupId}/apps`;
    return {
      list: () => api._get(groupUrl),
      create: (data, options) => {
        let query = (options && options.product) ? `?product=${options.product}` : '';
        return api._post(groupUrl + query, data);
      },

      app: (appId) => {
        const appUrl = `${groupUrl}/${appId}`;
        return {
          get: () => api._get(appUrl),
          remove: () => api._delete(appUrl),

          export: () => api._get(`${appUrl}/export`, undefined, {Accept: 'application/zip'}),

          measurements: (filter) => api._get(`${appUrl}/measurements`, filter),

          commands: () => ({
            run: (command, data) => api._post(`${appUrl}/commands/${command}`, data)
          }),

          values: () => ({
            list: () => api._get(`${appUrl}/values`),
            create: (data) => api._post( `${appUrl}/values`, data),
            value: (valueId) => {
              const valueUrl = `${appUrl}/values/${valueId}`;
              return {
                get: () => api._get(valueUrl),
                remove: () => api._delete(valueUrl),
                update: (data) => api._put(valueUrl, { body: JSON.stringify(data) })
              };
            }
          }),

          secrets: () => ({
            list: () => api._get(`${appUrl}/secrets`),
            create: (data) => api._post( `${appUrl}/secrets`, data),
            secret: (secretId) => {
              const secretUrl = `${appUrl}/secrets/${secretId}`;
              return {
                remove: () => api._delete(secretUrl),
                update: (data) => api._put(secretUrl, { body: JSON.stringify(data) })
              };
            }
          }),

          hosting: () => ({
            config: () => ({
              get: () => api._get(`${appUrl}/hosting/config`),
              patch: (config) => api._patch(`${appUrl}/hosting/config`, { body: JSON.stringify(config) })
            }),
            cache: () => ({
              invalidate: (path) => api._put(`${appUrl}/hosting/cache`, { body: JSON.stringify({ invalidate: true, path: path }) })
            }),
            assets: () => ({
              createDirectory: (folderName) => api._put(`${appUrl}/hosting/assets/asset`, { body: JSON.stringify({ path: `${folderName}/` }) }),
              list: (params) => api._get(`${appUrl}/hosting/assets`, params),
              upload: (metadata, body) => {
                const form = new FormData();
                form.append('meta', metadata);
                form.append('file', body);
                return api._put(`${appUrl}/hosting/assets/asset`, { body: form, multipart: true });
              },
              post: (data) => api._post(`${appUrl}/hosting/assets`, data),
              asset: () => ({
                patch: (options) => api._patch(`${appUrl}/hosting/assets/asset`, { body: JSON.stringify({ attributes: options.attributes }), queryParams: { path: options.path } }),
                get: (params) => api._get(`${appUrl}/hosting/assets/asset`, params),
                delete: (params) => api._delete(`${appUrl}/hosting/assets/asset`, params)
              })
            })
          }),

          services: () => ({
            list: () => api._get(`${appUrl}/services`),
            create: (data) => api._post(`${appUrl}/services`, data),
            service: (serviceId) => ({
              get: () => api._get(`${appUrl}/services/${serviceId}`),
              remove: () => api._delete(`${appUrl}/services/${serviceId}`),
              update: (data) => api._patch(`${appUrl}/services/${serviceId}`, { body: JSON.stringify(data) }),
              runCommand: (commandName, data) => api._post(`${appUrl}/services/${serviceId}/commands/${commandName}`, data),
              config: () => ({
                get: (params) => api._get(`${appUrl}/services/${serviceId}/config`, params),
                update: (data) => api._patch(`${appUrl}/services/${serviceId}/config`, { body: JSON.stringify(data) })
              }),

              rules: () => ({
                list: () => api._get(`${appUrl}/services/${serviceId}/rules`),
                create: (data) => api._post(`${appUrl}/services/${serviceId}/rules`, data),
                rule: (ruleId) => {
                  const ruleUrl = `${appUrl}/services/${serviceId}/rules/${ruleId}`;
                  return {
                    get: () => api._get(ruleUrl),
                    update: (data) => api._put(ruleUrl, { body: JSON.stringify(data) }),
                    remove: () => api._delete(ruleUrl)
                  };
                }
              }),

              incomingWebhooks: () => ({
                list: () => api._get(`${appUrl}/services/${serviceId}/incoming_webhooks`),
                create: (data) => api._post(`${appUrl}/services/${serviceId}/incoming_webhooks`, data),
                incomingWebhook: (incomingWebhookId) => {
                  const webhookUrl = `${appUrl}/services/${serviceId}/incoming_webhooks/${incomingWebhookId}`;
                  return {
                    get: () => api._get(webhookUrl),
                    update: (data) => api._put(webhookUrl, { body: JSON.stringify(data) }),
                    remove: () => api._delete(webhookUrl)
                  };
                }
              })
            })
          }),

          pushNotifications: () => ({
            list: (filter) => api._get(`${appUrl}/push/notifications`, filter),
            create: (data) => api._post(`${appUrl}/push/notifications`, data),
            pushNotification: (messageId) => ({
              get: () => api._get(`${appUrl}/push/notifications/${messageId}`),
              update: (data) => api._put(`${appUrl}/push/notifications/${messageId}`, { body: JSON.stringify(data) }),
              remove: () => api._delete(`${appUrl}/push/notifications/${messageId}`),
              send: () => api._post(`${appUrl}/push/notifications/${messageId}/send`)
            })
          }),

          users: () => ({
            list: (filter) => api._get(`${appUrl}/users`, filter),
            create: (user) => api._post(`${appUrl}/users`, user),
            user: (uid) => ({
              get: () => api._get(`${appUrl}/users/${uid}`),
              devices: () => ({
                get: () => api._get(`${appUrl}/users/${uid}/devices`)
              }),
              logout: () => api._put(`${appUrl}/users/${uid}/logout`),
              enable: () => api._put(`${appUrl}/users/${uid}/enable`),
              disable: () => api._put(`${appUrl}/users/${uid}/disable`),
              remove: () => api._delete(`${appUrl}/users/${uid}`)
            })
          }),

          userRegistrations: () => ({
            sendConfirmationEmail: (email) => api._post(`${appUrl}/user_registrations/by_email/${email}/send_confirm`)
          }),

          debug: () => ({
            executeFunction: (userId, name = '', ...args) => {
              return api._post(
                `${appUrl}/debug/execute_function`,
                {name, 'arguments': args},
                { user_id: userId });
            },
            executeFunctionSource: ({userId, source = '', evalSource = '', runAsSystem}) => {
              return api._post(
                `${appUrl}/debug/execute_function_source`,
                {source, 'eval_source': evalSource},
                { user_id: userId, run_as_system: runAsSystem });
            }
          }),

          authProviders: () => ({
            list: () => api._get(`${appUrl}/auth_providers`),
            create: (data) => api._post(`${appUrl}/auth_providers`, data),
            authProvider: (providerId) => ({
              get: () => api._get(`${appUrl}/auth_providers/${providerId}`),
              update: (data) => api._patch(`${appUrl}/auth_providers/${providerId}`, { body: JSON.stringify(data) }),
              enable: () => api._put(`${appUrl}/auth_providers/${providerId}/enable`),
              disable: () => api._put(`${appUrl}/auth_providers/${providerId}/disable`),
              remove: () => api._delete(`${appUrl}/auth_providers/${providerId}`)
            })
          }),

          security: () => ({
            allowedRequestOrigins: () => ({
              get: () => api._get(`${appUrl}/security/allowed_request_origins`),
              update: (data) => api._post(`${appUrl}/security/allowed_request_origins`, data)
            })
          }),

          logs: () => ({
            list: (filter) => api._get(`${appUrl}/logs`, filter)
          }),

          apiKeys: () => ({
            list: () => api._get(`${appUrl}/api_keys`),
            create: (data) => api._post(`${appUrl}/api_keys`, data),
            apiKey: (apiKeyId) => ({
              get: () => api._get(`${appUrl}/api_keys/${apiKeyId}`),
              remove: () => api._delete(`${appUrl}/api_keys/${apiKeyId}`),
              enable: () => api._put(`${appUrl}/api_keys/${apiKeyId}/enable`),
              disable: () => api._put(`${appUrl}/api_keys/${apiKeyId}/disable`)
            })
          }),

          functions: () => ({
            list: () => api._get(`${appUrl}/functions`),
            create: (data) => api._post(`${appUrl}/functions`, data),
            function: (functionId) => ({
              get: () => api._get(`${appUrl}/functions/${functionId}`),
              update: (data) => api._put(`${appUrl}/functions/${functionId}`, { body: JSON.stringify(data) }),
              remove: () => api._delete(`${appUrl}/functions/${functionId}`)
            })
          }),

          eventSubscriptions: () => ({
            list: (filter) => api._get(`${appUrl}/event_subscriptions`, filter),
            create: (data) => api._post(`${appUrl}/event_subscriptions`, data),
            eventSubscription: (eventSubscriptionId) => ({
              get: () => api._get(`${appUrl}/event_subscriptions/${eventSubscriptionId}`),
              update: (data) => api._put(`${appUrl}/event_subscriptions/${eventSubscriptionId}`, { body: JSON.stringify(data) }),
              remove: () => api._delete(`${appUrl}/event_subscriptions/${eventSubscriptionId}`),
              resume: (data) => api._put(`${appUrl}/event_subscriptions/${eventSubscriptionId}/resume`, { body: JSON.stringify(data) })
            })
          })
        };
      }
    };
  }
}
