/* global window, fetch */
/* eslint no-labels: ['error', { 'allowLoop': true }] */
import 'fetch-everywhere';
import { newStitchClient, StitchClient } from './client';
import ADMIN_CLIENT_TYPE from './common';
import { ADMIN_CLIENT_CODEC } from './auth/common';
import { StitchError } from './errors';

const v2 = 2;
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
      _get: (url, queryParams) => v3do(url, 'GET', {queryParams}),
      _put: (url, data) =>
        (data ?
          v3do(url, 'PUT', {body: JSON.stringify(data)}) :
          v3do(url, 'PUT')),
      _patch: (url, data) =>
        (data ?
          v3do(url, 'PATCH', {body: JSON.stringify(data)}) :
          v3do(url, 'PATCH')),
      _delete: (url)  => v3do(url, 'DELETE'),
      _post: (url, body, queryParams) =>
        (queryParams ?
          v3do(url, 'POST', { body: JSON.stringify(body), queryParams }) :
          v3do(url, 'POST', { body: JSON.stringify(body) }))
    };
  }

  get _v2() {
    const v2do = (url, method, options) =>
      super._do(
        url,
        method,
        Object.assign({}, { apiVersion: v2 }, options)
      ).then(response => {
        const contentHeader = response.headers.get('content-type') || '';
        if (contentHeader.split(',').indexOf('application/json') >= 0) {
          return response.json();
        }
        return response;
      });

    return {
      _get: (url, queryParams) => v2do(url, 'GET', {queryParams}),
      _put: (url, data) =>
        (data ?
          v2do(url, 'PUT', {body: JSON.stringify(data)}) :
          v2do(url, 'PUT')),
      _patch: (url, data) =>
        (data ?
          v2do(url, 'PATCH', {body: JSON.stringify(data)}) :
          v2do(url, 'PATCH')),
      _delete: (url)  => v2do(url, 'DELETE'),
      _post: (url, body, queryParams) =>
        (queryParams ?
          v2do(url, 'POST', { body: JSON.stringify(body), queryParams }) :
          v2do(url, 'POST', { body: JSON.stringify(body) }))
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
        let query = (options && options.defaults) ? '?defaults=true' : '';
        return api._post(groupUrl + query, data);
      },

      app: (appId) => {
        const appUrl = `${groupUrl}/${appId}`;
        return {
          get: () => api._get(appUrl),
          remove: () => api._delete(appUrl),

          export: () => api._get(`${appUrl}/export`),

          values: () => ({
            list: () => api._get(`${appUrl}/values`),
            create: (data) => api._post( `${appUrl}/values`, data),
            value: (valueId) => {
              const valueUrl = `${appUrl}/values/${valueId}`;
              return {
                get: ()=> api._get(valueUrl),
                remove: ()=> api._delete(valueUrl),
                update: (data) => api._put(valueUrl, data)
              };
            }
          }),

          services: () => ({
            list: () => api._get(`${appUrl}/services`),
            create: (data) => api._post(`${appUrl}/services`, data),
            service: (serviceId) => ({
              get: () => api._get(`${appUrl}/services/${serviceId}`),
              remove: () => api._delete(`${appUrl}/services/${serviceId}`),
              runCommand: (commandName, data) => api._post(`${appUrl}/services/${serviceId}/commands/${commandName}`, data),
              config: ()=> ({
                get: () => api._get(`${appUrl}/services/${serviceId}/config`),
                update: (data) => api._patch(`${appUrl}/services/${serviceId}/config`, data)
              }),

              rules: () => ({
                list: () => api._get(`${appUrl}/services/${serviceId}/rules`),
                create: (data) => api._post(`${appUrl}/services/${serviceId}/rules`, data),
                rule: (ruleId) => {
                  const ruleUrl = `${appUrl}/services/${serviceId}/rules/${ruleId}`;
                  return {
                    get: () => api._get(ruleUrl),
                    update: (data) => api._put(ruleUrl, data),
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
                    update: (data) => api._put(webhookUrl, data),
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
              update: (data) => api._put(`${appUrl}/push/notifications/${messageId}`, data),
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
            executeFunctionSource: (userId, source = '', evalSource = '') => {
              return api._post(
                `${appUrl}/debug/execute_function_source`,
                {source, 'eval_source': evalSource},
                { user_id: userId });
            }
          }),

          authProviders: () => ({
            list: () => api._get(`${appUrl}/auth_providers`),
            create: (data) => api._post(`${appUrl}/auth_providers`, data),
            authProvider: (providerId) => ({
              get: () => api._get(`${appUrl}/auth_providers/${providerId}`),
              update: (data) => api._patch(`${appUrl}/auth_providers/${providerId}`, data),
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
              update: (data) => api._put(`${appUrl}/functions/${functionId}`, data),
              remove: () => api._delete(`${appUrl}/functions/${functionId}`)
            })
          })
        };
      }
    };
  }

  v2() {
    const api = this._v2;
    return {

      apps: (groupId)  => {
        const groupUrl = `/groups/${groupId}/apps`;
        return {
          list: () => api._get(groupUrl),
          create: (data, options) => {
            let query = (options && options.defaults) ? '?defaults=true' : '';
            return api._post(groupUrl + query, data);
          },

          app: (appId) => {
            const appUrl = `${groupUrl}/${appId}`;
            return {
              get: () => api._get(appUrl),
              remove: () => api._delete(appUrl),

              pipelines: () => ({
                list: () => api._get(`${appUrl}/pipelines`),
                create: (data) => api._post( `${appUrl}/pipelines`, data),
                pipeline: (pipelineId) => {
                  const pipelineUrl = `${appUrl}/pipelines/${pipelineId}`;
                  return {
                    get: ()=> api._get(pipelineUrl),
                    remove: ()=> api._delete(pipelineUrl),
                    update: (data) => api._put(pipelineUrl, data)
                  };
                }
              }),

              values: () => ({
                list: () => api._get(`${appUrl}/values`),
                create: (data) => api._post( `${appUrl}/values`, data),
                value: (valueId) => {
                  const valueUrl = `${appUrl}/values/${valueId}`;
                  return {
                    get: ()=> api._get(valueUrl),
                    remove: ()=> api._delete(valueUrl),
                    update: (data) => api._put(valueUrl, data)
                  };
                }
              }),

              services: () => ({
                list: () => api._get(`${appUrl}/services`),
                create: (data) => api._post(`${appUrl}/services`, data),
                service: (serviceId) => ({
                  get: () => api._get(`${appUrl}/services/${serviceId}`),
                  remove: () => api._delete(`${appUrl}/services/${serviceId}`),
                  runCommand: (commandName, data) => api._post(`${appUrl}/services/${serviceId}/commands/${commandName}`, data),
                  config: ()=> ({
                    get: () => api._get(`${appUrl}/services/${serviceId}/config`),
                    update: (data) => api._patch(`${appUrl}/services/${serviceId}/config`, data)
                  }),

                  rules: () => ({
                    list: () => api._get(`${appUrl}/services/${serviceId}/rules`),
                    create: (data) => api._post(`${appUrl}/services/${serviceId}/rules`, data),
                    rule: (ruleId) => {
                      const ruleUrl = `${appUrl}/services/${serviceId}/rules/${ruleId}`;
                      return {
                        get: () => api._get(ruleUrl),
                        update: (data) => api._put(ruleUrl, data),
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
                        update: (data) => api._put(webhookUrl, data),
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
                  update: (data) => api._put(`${appUrl}/push/notifications/${messageId}`, data),
                  setType: (type) => api._put(`${appUrl}/push/notifications/${messageId}/type`, { type }),
                  remove: () => api._delete(`${appUrl}/push/notifications/${messageId}`)
                })
              }),

              users: () => ({
                list: (filter) => api._get(`${appUrl}/users`, filter),
                create: (user) => api._post(`${appUrl}/users`, user),
                user: (uid) => ({
                  get: () => api._get(`${appUrl}/users/${uid}`),
                  logout: () => api._put(`${appUrl}/users/${uid}/logout`),
                  remove: () => api._delete(`${appUrl}/users/${uid}`)
                })
              }),

              dev: () => ({
                executePipeline: (body, userId, options) => {
                  return api._post(
                    `${appUrl}/dev/pipeline`,
                    body,
                    Object.assign({}, options, { user_id: userId }));
                }
              }),

              authProviders: () => ({
                list: () => api._get(`${appUrl}/auth_providers`),
                create: (data) => api._post(`${appUrl}/auth_providers`, data),
                authProvider: (providerId) => ({
                  get: () => api._get(`${appUrl}/auth_providers/${providerId}`),
                  update: (data) => api._patch(`${appUrl}/auth_providers/${providerId}`, data),
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
              })
            };
          }
        };
      }
    };
  }
}
