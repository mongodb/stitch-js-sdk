/* global window, fetch */
/* eslint no-labels: ['error', { 'allowLoop': true }] */
import 'fetch-everywhere';
import StitchClient from './client';
import ADMIN_CLIENT_TYPE from './common';
import { ADMIN_CLIENT_CODEC } from './auth/common';

const v1 = 1;
const v2 = 2;
const v3 = 3;

export default class Admin extends StitchClient {
  constructor(baseUrl) {
    super('', {baseUrl, authCodec: ADMIN_CLIENT_CODEC});
  }

  get type() {
    return ADMIN_CLIENT_TYPE;
  }

  get _v2() {
    const v2do = (url, method, options) =>
      super._do(
        url,
        method,
        Object.assign({}, {apiVersion: v2}, options)
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

  get _v3() {
    const v3do = (url, method, options) =>
       this.client._do(
         url,
         method,
         Object.assign({}, {apiVersion: v3}, options)
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

  get _v1() {
    const v1do = (url, method, options) =>
      super._do(
        url,
        method,
        Object.assign({}, {apiVersion: v1}, options)
      ).then(response => response.json());
    return {
      _get: (url, queryParams) => v1do(url, 'GET', {queryParams}),
      _put: (url, options) => v1do(url, 'PUT', options),
      _delete: (url)  => v1do(url, 'DELETE'),
      _post: (url, body) => v1do(url, 'POST', {body: JSON.stringify(body)})
    };
  }

  profile() {
    const api = this._v1;
    return {
      keys: () => ({
        list: () => api._get('/profile/keys'),
        create: (key) => api._post('/profile/keys'),
        apiKey: (keyId) => ({
          get: () => api._get(`/profile/keys/${keyId}`),
          remove: () => api._delete(`/profile/keys/${keyId}`),
          enable: () => api._put(`/profile/keys/${keyId}/enable`),
          disable: () => api._put(`/profile/keys/${keyId}/disable`)
        })
      })
    };
  }

  /**
   * Ends the session for the current user.
   *
   * @returns {Promise}
   */
  logout() {
    return super._do('/auth/session', 'DELETE', { refreshOnFailure: false, useRefreshToken: true, apiVersion: v2 })
      .then(() => this.auth.clear());
  }

  /**
   * Returns profile information for the currently logged in user
   *
   * @returns {Promise}
   */
  userProfile() {
    return this._v2._get('/auth/profile');
  }

  /**
   * Returns available providers for the currently logged in admin
   *
   * @returns {Promise}
   */
  getAuthProviders() {
    return super._do('/auth/providers', 'GET', { noAuth: true, apiVersion: v2 })
      .then(response => response.json());
  }

  /**
   * Returns an access token for the user
   *
   * @returns {Promise}
   */
  doSessionPost() {
    return super._do('/auth/session', 'POST', { refreshOnFailure: false, useRefreshToken: true, apiVersion: v2 })
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
    const api = this._v1;
    return {
      list: () => api._get(`/groups/${groupId}/apps`),
      create: (data, options) => {
        let query = (options && options.defaults) ? '?defaults=true' : '';
        return api._post(`/groups/${groupId}/apps` + query, data);
      },

      app: (appID) => ({
        get: () => api._get(`/groups/${groupId}/apps/${appID}`),
        remove: () => api._delete(`/groups/${groupId}/apps/${appID}`),
        replace: (doc) => api._put(`/groups/${groupId}/apps/${appID}`, {
          headers: { 'X-Stitch-Unsafe': appID },
          body: JSON.stringify(doc)
        }),

        messages: () => ({
          list: (filter) =>  api._get(`/groups/${groupId}/apps/${appID}/push/messages`, filter),
          create: (msg) =>  api._put(`/groups/${groupId}/apps/${appID}/push/messages`,  {body: JSON.stringify(msg)}),
          message: (id) => ({
            get: () => api._get(`/groups/${groupId}/apps/${appID}/push/messages/${id}`),
            remove: () => api._delete(`/groups/${groupId}/apps/${appID}/push/messages/${id}`),
            setSaveType: type => api._post(`/groups/${groupId}/apps/${appID}/push/messages/${id}`, {type}),
            update: msg => api._put(`/groups/${groupId}/apps/${appID}/push/messages/${id}`, {body: JSON.stringify(msg)})
          })
        }),

        users: () => ({
          list: (filter) => api._get(`/groups/${groupId}/apps/${appID}/users`, filter),
          create: (user) => api._post(`/groups/${groupId}/apps/${appID}/users`, user),
          user: (uid) => ({
            get: () => api._get(`/groups/${groupId}/apps/${appID}/users/${uid}`),
            logout: () => api._put(`/groups/${groupId}/apps/${appID}/users/${uid}/logout`),
            remove: () => api._delete(`/groups/${groupId}/apps/${appID}/users/${uid}`)
          })
        }),

        sandbox: () => ({
          executePipeline: (data, userId, options) => {
            const queryParams = Object.assign({}, options, {user_id: userId});
            return super._do(
              `/groups/${groupId}/apps/${appID}/sandbox/pipeline`,
              'POST',
              {body: JSON.stringify(data), queryParams});
          }
        }),

        authProviders: () => ({
          create: (data) => api._post(`/groups/${groupId}/apps/${appID}/authProviders`, data),
          list: () => api._get(`/groups/${groupId}/apps/${appID}/authProviders`),
          provider: (authType, authName) => ({
            get: () => api._get(`/groups/${groupId}/apps/${appID}/authProviders/${authType}/${authName}`),
            remove: () => api._delete(`/groups/${groupId}/apps/${appID}/authProviders/${authType}/${authName}`),
            update: (data) => api._post(`/groups/${groupId}/apps/${appID}/authProviders/${authType}/${authName}`, data)
          })
        }),
        security: () => ({
          allowedRequestOrigins: () => ({
            get: () => api._get(`/groups/${groupId}/apps/${appID}/security/allowedRequestOrigins`),
            update: (data) => api._post(`/groups/${groupId}/apps/${appID}/security/allowedRequestOrigins`, data)
          })
        }),
        values: () => ({
          list: () => api._get(`/groups/${groupId}/apps/${appID}/values`),
          value: (varName) => ({
            get: () => api._get(`/groups/${groupId}/apps/${appID}/values/${varName}`),
            remove: () => api._delete(`/groups/${groupId}/apps/${appID}/values/${varName}`),
            create: (data) => api._post(`/groups/${groupId}/apps/${appID}/values/${varName}`, data),
            update: (data) => api._post(`/groups/${groupId}/apps/${appID}/values/${varName}`, data)
          })
        }),
        pipelines: () => ({
          list: () => api._get(`/groups/${groupId}/apps/${appID}/pipelines`),
          pipeline: (varName) => ({
            get: () => api._get(`/groups/${groupId}/apps/${appID}/pipelines/${varName}`),
            remove: () => api._delete(`/groups/${groupId}/apps/${appID}/pipelines/${varName}`),
            create: (data) => api._post(`/groups/${groupId}/apps/${appID}/pipelines/${varName}`, data),
            update: (data) => api._post(`/groups/${groupId}/apps/${appID}/pipelines/${varName}`, data)
          })
        }),
        logs: () => ({
          get: (filter) => api._get(`/groups/${groupId}/apps/${appID}/logs`, filter)
        }),
        apiKeys: () => ({
          list: () => api._get(`/groups/${groupId}/apps/${appID}/keys`),
          create: (data) => api._post(`/groups/${groupId}/apps/${appID}/keys`, data),
          apiKey: (key) => ({
            get: () => api._get(`/groups/${groupId}/apps/${appID}/keys/${key}`),
            remove: () => api._delete(`/groups/${groupId}/apps/${appID}/keys/${key}`),
            enable: () => api._put(`/groups/${groupId}/apps/${appID}/keys/${key}/enable`),
            disable: () => api._put(`/groups/${groupId}/apps/${appID}/keys/${key}/disable`)
          })
        }),
        services: () => ({
          list: () => api._get(`/groups/${groupId}/apps/${appID}/services`),
          create: (data) => api._post(`/groups/${groupId}/apps/${appID}/services`, data),
          service: (svc) => ({
            get: () => api._get(`/groups/${groupId}/apps/${appID}/services/${svc}`),
            update: (data) => api._post(`/groups/${groupId}/apps/${appID}/services/${svc}`, data),
            remove: () => api._delete(`/groups/${groupId}/apps/${appID}/services/${svc}`),
            setConfig: (data) => api._post(`/groups/${groupId}/apps/${appID}/services/${svc}/config`, data),

            rules: () => ({
              list: () => api._get(`/groups/${groupId}/apps/${appID}/services/${svc}/rules`),
              create: (data) => api._post(`/groups/${groupId}/apps/${appID}/services/${svc}/rules`),
              rule: (ruleId) => ({
                get: () => api._get(`/groups/${groupId}/apps/${appID}/services/${svc}/rules/${ruleId}`),
                update: (data) => api._post(`/groups/${groupId}/apps/${appID}/services/${svc}/rules/${ruleId}`, data),
                remove: () => api._delete(`/groups/${groupId}/apps/${appID}/services/${svc}/rules/${ruleId}`)
              })
            }),

            incomingWebhooks: () => ({
              list: () => api._get(`/groups/${groupId}/apps/${appID}/services/${svc}/incomingWebhooks`),
              create: (data) => api._post(`/groups/${groupId}/apps/${appID}/services/${svc}/incomingWebhooks`, data),
              incomingWebhook: (incomingWebhookId) => ({
                get: () => api._get(`/groups/${groupId}/apps/${appID}/services/${svc}/incomingWebhooks/${incomingWebhookId}`),
                update: (data) => api._post(`/groups/${groupId}/apps/${appID}/services/${svc}/incomingWebhooks/${incomingWebhookId}`, data),
                remove: () => api._delete(`/groups/${groupId}/apps/${appID}/services/${svc}/incomingWebhooks/${incomingWebhookId}`)
              })
            })
          })
        })
      })
    };
  }

  v2() {
    const api = this._v2;
    const apiV3 = this._v3; // exists solely for function endpoints
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
              }),
              // Function endpoints are the only endpoints that are different between v2 and v3
              // Take note that this branch leverages `apiV3` for hitting function endpoints
              functions: () => ({
                list: () => apiV3._get(`${appUrl}/functions`),
                create: (data) => apiV3._post(`${appUrl}/functions`, data),
                function: (functionId) => ({
                  get: () => apiV3._get(`${appUrl}/functions/${functionId}`),
                  update: (data) => apiV3._put(`${appUrl}/functions/${functionId}`, data),
                  remove: () => apiV3._delete(`${appUrl}/functions/${functionId}`)
                })
              })
            };
          }
        };
      }
    };
  }

  _admin() {
    return {
      logs: () => ({
        get: (filter) => super._do('/admin/logs', 'GET', { useRefreshToken: true, queryParams: filter })
      }),
      users: () => ({
        list: (filter) => super._do('/admin/users', 'GET', { useRefreshToken: true, queryParams: filter }),
        user: (uid) => ({
          logout: () => super._do(`/admin/users/${uid}/logout`, 'PUT', { useRefreshToken: true })
        })
      })
    };
  }

  _isImpersonatingUser() {
    return this.auth.isImpersonatingUser();
  }

  _startImpersonation(userId) {
    return this.auth.startImpersonation(this, userId);
  }

  _stopImpersonation() {
    return this.auth.stopImpersonation();
  }
}
