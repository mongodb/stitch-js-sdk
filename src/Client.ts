import { AdminEventSubscription } from './api/v1/AdminEventSubscriptions';
import { AtlasCluster, CreateAtlasClusterRequest, CreateAtlasClusterResponse } from './api/v1/AtlasClusters';
import AtlasGroup from './api/v1/AtlasGroups';
import { CreateTempAPIKeyRequest, CreateTempAPIKeyResponse } from './api/v1/TempAPIKeys';
import { APIKey, PartialAPIKey } from './api/v3/APIKeys';
import { CreateAppRequest, PartialApp } from './api/v3/Apps';
import { AuthProviderConfig, AuthProviderType, PartialAuthProviderConfig } from './api/v3/AuthProviders';
import { CodeDeployUpdateRequest, GitHubBranch, Installation, PartialCodeDeploy } from './api/v3/CodeDeploy';
import CustomUserDataConfig from './api/v3/CustomUserData';
import { AppDependencies } from './api/v3/Dependencies';
import { Deployment, DeploymentsFilter } from './api/v3/Deployments';
import { DraftDiff, PartialDraft } from './api/v3/Drafts';
import { EventSubscription, EventSubscriptionResumeOptions, ResourceType } from './api/v3/EventSubscriptions';
import { AppFunction, PartialAppFunction } from './api/v3/Functions';
import { CustomResolver, GraphQLAlerts, GraphQLConfig } from './api/v3/GraphQL';
import { AssetMetadata, HostingConfig, TransformAssetRequest } from './api/v3/Hosting';
import { IncomingWebhook, PartialIncomingWebhook } from './api/v3/IncomingWebhooks';
import { AppLogRequest, AppLogResponse } from './api/v3/Logs';
import {
  AppMeasurementGroup,
  getMeasurementFilter,
  GroupMeasurementGroup,
  MeasurementRequest,
} from './api/v3/Measurements';
import { MessageState, PushNotification, SendNotificationRequest } from './api/v3/Push';
import { deserializePartialRule, deserializeRule, Rule } from './api/v3/Rules';
import { PartialSecret, Secret } from './api/v3/Secrets';
import { PartialServiceDesc, ServiceDesc, ServiceDescConfig } from './api/v3/Services';
import { PatchSyncSchemasRequest, SyncClientSchema, SyncConfig, SyncData, SyncProgress } from './api/v3/Sync';
import {
  Device,
  EmailPasswordRegistrationRequest,
  PartialUser,
  PasswordRecord,
  User,
  UserActionToken,
  UserFilter,
  UserProfile,
} from './api/v3/Users';
import { ValidationOptions } from './api/v3/ValidationSettings';
import { PartialValue, Value } from './api/v3/Values';
import { Storage } from './auth/Storage';
import Auth from './auth';
import { DEFAULT_REALM_SERVER_URL, FetchOptions, JSONTYPE, makeFetchArgs } from './Common';
import { ErrInvalidSession, ErrUnauthorized, RealmError, ResponseError } from './Errors';

import { EJSON } from 'bson';
import { JsonConvert } from 'json2typescript';
import queryString from 'query-string';

const jsonConvert: JsonConvert = new JsonConvert();
const v1 = 1;
const v3 = 3;
const API_TYPE_PRIVATE = 'private';
const API_TYPE_ADMIN = 'admin';

export default class RealmAdminClient {
  get _private() {
    return this.apiMethods(API_TYPE_PRIVATE, v1);
  }

  get _admin() {
    return this.apiMethods(API_TYPE_ADMIN, v3);
  }

  public readonly auth: Auth;

  private readonly baseUrl: string;

  private readonly authUrl: string;

  private readonly rootURLsByAPIVersion: Record<number, Record<string, string>>;

  private readonly storage: Storage;

  constructor(
    baseUrl: string = DEFAULT_REALM_SERVER_URL,
    options: {
      requestOrigin?: string;
      storage?: Storage;
    } = {}
  ) {
    this.authUrl = `${baseUrl}/api/admin/v3.0/auth`;

    this.rootURLsByAPIVersion = {
      [v1]: {
        [API_TYPE_PRIVATE]: `${baseUrl}/api/private/v1.0`,
      },
      [v3]: {
        [API_TYPE_ADMIN]: `${baseUrl}/api/admin/v3.0`,
      },
    };

    const authOptions: { storage?: Storage; requestOrigin?: string } = {
      storage: options.storage,
    };

    if (options.requestOrigin) {
      authOptions.requestOrigin = options.requestOrigin;
    }

    this.auth = new Auth(this, this.authUrl, authOptions);
    this.auth.handleCookie();
    return this;
  }

  /**
   * Submits an authentication request to the specified provider providing any
   * included options (read: user data).  If auth data already exists and the
   * existing auth data has an access token, then these credentials are returned.
   *
   * @param {String} providerType the provider used for authentication (The possible
   *                 options are 'userpass', 'apiKey', and 'mongodbCloud')
   * @param {Object} [options = {}] additional authentication options
   * @returns {Promise} which resolves to a String value: the authenticated user ID
   */
  public authenticate(providerType: AuthProviderType, options = {}) {
    // reuse existing auth if present
    const authenticateFn = () =>
      this.auth
        .provider(providerType)
        .authenticate(options)
        .then(() => this.authedId());

    if (this.isAuthenticated()) {
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
  public logout() {
    return this._do('/auth/session', 'DELETE', {
      refreshOnFailure: false,
      useRefreshToken: true,
    }).then(
      () => this.auth.clear(),
      () => this.auth.clear()
    );
  }

  /**
   * @returns {*} Returns any error from the Realm authentication system.
   */
  public authError() {
    return this.auth.error;
  }

  /**
   * @returns {Boolean} whether or not the current client is authenticated.
   */
  public isAuthenticated() {
    return !!this.authedId();
  }

  /**
   *  @returns {String} a string of the currently authenticated user's ID.
   */
  public authedId() {
    return this.auth.authedId;
  }

  /**
   * Returns an access token for the user
   *
   * @private
   * @returns {Promise}
   */
  public doSessionPost() {
    return this._do('/auth/session', 'POST', {
      refreshOnFailure: false,
      useRefreshToken: true,
    }).then((response) => response.json());
  }

  public _fetch(
    url: string,
    fetchArgs: RequestInit,
    resource: string,
    method: string,
    options: FetchOptions = {}
  ): Promise<Response> {
    return fetch(url, fetchArgs).then((response: Response) => {
      // Okay: passthrough
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
      }

      if (response.headers.get('Content-Type') === JSONTYPE) {
        return response.json().then((json) => {
          // Only want to try refreshing token when there's an invalid session
          if ('error_code' in json && json.error_code === ErrInvalidSession) {
            if (!options.refreshOnFailure) {
              this.auth.clear();
              const realmErr = new RealmError(json.error, json.error_code);
              realmErr.response = response;
              realmErr.json = json;
              throw realmErr;
            }

            return this.auth.refreshToken().then(() => {
              options.refreshOnFailure = false;
              return this._do(resource, method, options);
            });
          }

          const error = new RealmError(json.error, json.error_code);
          error.response = response;
          error.json = json;
          return Promise.reject(error);
        });
      }

      const respErr = new ResponseError(response.statusText);
      respErr.response = response;
      return Promise.reject(respErr);
    });
  }

  public _fetchArgs(resource: string, method: string, options: FetchOptions) {
    const appURL = this.rootURLsByAPIVersion[options.apiVersion ?? v3][options.apiType ?? API_TYPE_ADMIN];
    let url = `${appURL}${resource}`;
    if (options.rootURL) {
      url = `${options.rootURL}${resource}`;
    }
    const fetchArgs = makeFetchArgs(method, options);

    if (options.queryParams) {
      url = `${url}?${queryString.stringify(options.queryParams)}`;
    }

    return { url, fetchArgs };
  }

  public _do(resource: string, method: string, options: FetchOptions = {}) {
    options = {
      apiType: API_TYPE_ADMIN,
      apiVersion: v3,
      refreshOnFailure: true,
      rootURL: undefined,
      useRefreshToken: false,
      ...options,
    };

    const token = options.useRefreshToken ? this.auth.getRefreshToken() : this.auth.getAccessToken();

    if (!options.headers) {
      options.headers = {};
    }
    if (this.auth.requestOrigin && !options.skipDraft) {
      options.headers['X-BAAS-Request-Origin'] = this.auth.requestOrigin;
    }

    if (!options.noAuth) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const { url, fetchArgs } = this._fetchArgs(resource, method, options);
    if (options.noAuth) {
      return this._fetch(url, fetchArgs, resource, method, options);
    }

    if (!this.isAuthenticated()) {
      return Promise.reject(new RealmError('Must auth first', ErrUnauthorized));
    }

    return this._fetch(url, fetchArgs, resource, method, options);
  }

  /**
   * Returns profile information for the currently logged in user
   *
   * @returns {Promise}
   */
  public userProfile() {
    return this._admin._get('/auth/profile', UserProfile);
  }

  /**
   * Returns available providers for the currently logged in admin
   *
   * @returns {Promise}
   */
  public getAuthProviders() {
    return this._do('/auth/providers', 'GET', {
      noAuth: true,
    })
      .then((response: Response) => response.text())
      .then((response) =>
        Object.values(EJSON.parse(response)).map((val: any) => jsonConvert.deserializeObject(val, AuthProviderConfig))
      );
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
   */
  public apps(groupId: string) {
    const api = this._admin;
    const groupUrl = `/groups/${groupId}/apps`;
    return {
      measurements: (request?: MeasurementRequest) => {
        const filter = getMeasurementFilter(request);
        return api._get(`/groups/${groupId}/measurements`, GroupMeasurementGroup, filter);
      },
      app: (appId: string) => {
        const appUrl = `${groupUrl}/${appId}`;
        return {
          get: () => api._get(appUrl, PartialApp),
          remove: () => api._delete(appUrl),

          export: () =>
            api._getUntyped(
              `${appUrl}/export`,
              { version: '20200603' },
              {
                Accept: 'application/zip',
              }
            ),

          measurements: (request?: MeasurementRequest) => {
            const filter = getMeasurementFilter(request);
            return api._get(`${appUrl}/measurements`, AppMeasurementGroup, filter);
          },

          commands: () => ({
            run: (command: string, data?: Record<string, any>) =>
              api._postUntyped(`${appUrl}/commands/${command}`, data),
          }),

          dependencies: () => ({
            list: () => api._get(`${appUrl}/dependencies`, AppDependencies),
            upload: (filename: string, body: string) => {
              const form = new FormData();
              form.append('file', body, filename);
              return api._postRaw(`${appUrl}/dependencies`, {
                body: form,
                multipart: true,
              });
            },
          }),

          values: () => ({
            create: (val: Value) => api._post(`${appUrl}/values`, PartialValue, val),
            list: (): Promise<PartialValue[]> => api._list(`${appUrl}/values`, PartialValue),
            value: (valueId: string) => {
              const valueUrl = `${appUrl}/values/${valueId}`;
              return {
                get: (): Promise<Value> => api._get(valueUrl, Value),
                remove: () => api._delete(valueUrl),
                update: (val: Value) => api._put(valueUrl, val),
              };
            },
          }),

          secrets: () => ({
            create: (secret: Secret) => api._post(`${appUrl}/secrets`, PartialSecret, secret),
            list: () => api._list(`${appUrl}/secrets`, PartialSecret),
            secret: (secretId: string) => {
              const secretUrl = `${appUrl}/secrets/${secretId}`;
              return {
                remove: () => api._delete(secretUrl),
                update: (secret: Secret) => api._put(secretUrl, secret),
              };
            },
          }),

          hosting: () => ({
            assets: () => ({
              asset: (path: string) => ({
                delete: () => api._delete(`${appUrl}/hosting/assets/asset`, { path }),
                get: () =>
                  api._get(`${appUrl}/hosting/assets/asset`, AssetMetadata, {
                    path,
                  }),
                patch: (options: { attributes: Array<{ name: string; value: string }> }) =>
                  api._patchRaw(`${appUrl}/hosting/assets/asset`, {
                    body: JSON.stringify({ attributes: options.attributes }),
                    queryParams: { path },
                  }),
              }),
              createDirectory: (folderName: string) =>
                api._putRaw(`${appUrl}/hosting/assets/asset`, {
                  body: JSON.stringify({ path: `${folderName}/` }),
                }),
              list: (prefix?: string, recursive?: boolean) => {
                const filter: Record<string, any> = {};
                if (prefix) {
                  filter.prefix = prefix;
                }
                if (recursive) {
                  filter.recursive = recursive;
                }
                return api._list(`${appUrl}/hosting/assets`, AssetMetadata, filter);
              },
              transform: (request: TransformAssetRequest) => api._postNoContent(`${appUrl}/hosting/assets`, request),
              upload: (metadata: AssetMetadata, body: string) => {
                const form = new FormData();
                form.append('meta', JSON.stringify(jsonConvert.serialize(metadata)));
                form.append('file', body);
                return api._putRaw(`${appUrl}/hosting/assets/asset`, {
                  body: form,
                  multipart: true,
                });
              },
            }),
            cache: () => ({
              invalidate: (path: string) =>
                api._putRaw(`${appUrl}/hosting/cache`, {
                  body: JSON.stringify({ invalidate: true, path }),
                }),
            }),
            config: () => ({
              get: () => api._get(`${appUrl}/hosting/config`, HostingConfig),
              patch: (config: HostingConfig) => api._patch(`${appUrl}/hosting/config`, config),
            }),
          }),

          deploy: () => ({
            auth: () => ({
              github: () =>
                api._getUntyped(`${appUrl}/deploy/github/auth`, undefined, undefined, {
                  credentials: 'include',
                }),
            }),
            config: () => api._get(`${appUrl}/deploy/config`, PartialCodeDeploy),
            deployments: () => ({
              get: (commit: string) => api._get(`${appUrl}/deployments/${commit}`, Deployment),
              list: (filter?: DeploymentsFilter) => {
                let queryFilter: Record<string, any>;
                if (filter) {
                  queryFilter = {};
                  if (filter.before) {
                    queryFilter.before = filter.before;
                  }
                  if (filter.limit) {
                    queryFilter.limit = filter.limit;
                  }
                  if (filter.draftId) {
                    queryFilter.draft_id = filter.draftId;
                  }
                  if (filter.userId) {
                    queryFilter.user_id = filter.userId;
                  }
                }
                return api._list(`${appUrl}/deployments`, Deployment, filter);
              },
            }),
            installation: () => api._list(`${appUrl}/deploy/installation`, Installation),
            overwriteConfig: (config: CodeDeployUpdateRequest) => api._put(`${appUrl}/deploy/config`, config),
            repositories: () => ({
              repository: (repoId: string) => ({
                github: () => ({
                  branches: () => ({
                    list: () => api._list(`${appUrl}/deploy/github/repositories/${repoId}/branches`, GitHubBranch),
                  }),
                }),
              }),
            }),
            updateConfig: (config: CodeDeployUpdateRequest) => api._patch(`${appUrl}/deploy/config`, config),
          }),

          drafts: () => ({
            create: () => api._post(`${appUrl}/drafts`, PartialDraft),
            delete: (draftId: string) => api._delete(`${appUrl}/drafts/${draftId}`),
            deploy: (draftId: string, allowDestructiveChanges?: boolean) => {
              let filter: Record<string, any> | undefined;
              if (allowDestructiveChanges) {
                filter = { allow_destructive_changes: allowDestructiveChanges };
              }
              return api._post(`${appUrl}/drafts/${draftId}/deployment`, Deployment, undefined, filter);
            },
            diff: (draftId: string) => api._get(`${appUrl}/drafts/${draftId}/diff`, DraftDiff),
            get: (draftId: string) => api._get(`${appUrl}/drafts/${draftId}`, PartialDraft),
            list: () => api._list(`${appUrl}/drafts`, PartialDraft),
          }),

          services: () => ({
            create: (desc: ServiceDesc, skipDraft = false) =>
              api._post(`${appUrl}/services`, PartialServiceDesc, desc, undefined, { skipDraft }),
            list: () => api._list(`${appUrl}/services`, PartialServiceDesc),
            service: (serviceId: string) => ({
              config: () => ({
                get: (): Promise<Record<string, any>> => api._getUntyped(`${appUrl}/services/${serviceId}/config`),
                getWithSecrets: () =>
                  api._get(`${appUrl}/services/${serviceId}/config`, ServiceDescConfig, {
                    includeSecretConfig: true,
                  }),
                update: (config: Record<string, any>) =>
                  api._patchRaw(`${appUrl}/services/${serviceId}/config`, {
                    body: JSON.stringify(config),
                  }),
                updateWithSecrets: (config: ServiceDescConfig) =>
                  api._patch(`${appUrl}/services/${serviceId}/config`, config),
              }),
              get: () => api._get(`${appUrl}/services/${serviceId}`, PartialServiceDesc),
              incomingWebhooks: () => ({
                create: (webhook: IncomingWebhook) =>
                  api._post(`${appUrl}/services/${serviceId}/incoming_webhooks`, PartialIncomingWebhook, webhook),
                incomingWebhook: (incomingWebhookId: string) => {
                  const webhookUrl = `${appUrl}/services/${serviceId}/incoming_webhooks/${incomingWebhookId}`;
                  return {
                    get: () => api._get(webhookUrl, IncomingWebhook),
                    remove: () => api._delete(webhookUrl),
                    update: (webhook: IncomingWebhook) => api._put(webhookUrl, webhook),
                  };
                },
                list: () => api._list(`${appUrl}/services/${serviceId}/incoming_webhooks`, PartialIncomingWebhook),
              }),
              remove: (allowDestructiveChanges?: boolean) => {
                let filter: Record<string, any> | undefined;
                if (allowDestructiveChanges) {
                  filter = {
                    allow_destructive_changes: allowDestructiveChanges,
                  };
                }
                return api._delete(`${appUrl}/services/${serviceId}`, filter);
              },
              rules: () => ({
                create: (rule: Rule, allowDestructiveChanges?: boolean) => {
                  let filter: Record<string, any> | undefined;
                  if (allowDestructiveChanges) {
                    filter = {
                      allow_destructive_changes: allowDestructiveChanges,
                    };
                  }
                  return api._postConvert(
                    `${appUrl}/services/${serviceId}/rules`,
                    rule,
                    deserializePartialRule,
                    filter
                  );
                },
                list: () => api._listConvert(`${appUrl}/services/${serviceId}/rules`, deserializePartialRule),
                rule: (ruleId: string) => {
                  const ruleUrl = `${appUrl}/services/${serviceId}/rules/${ruleId}`;
                  return {
                    get: () => api._getConvert(deserializeRule, ruleUrl),
                    remove: (allowDestructiveChanges?: boolean) => {
                      let filter: Record<string, any> | undefined;
                      if (allowDestructiveChanges) {
                        filter = {
                          allow_destructive_changes: allowDestructiveChanges,
                        };
                      }
                      return api._delete(ruleUrl, filter);
                    },
                    update: (rule: Rule, allowDestructiveChanges?: boolean) => {
                      let filter: Record<string, any> | undefined;
                      if (allowDestructiveChanges) {
                        filter = {
                          allow_destructive_changes: allowDestructiveChanges,
                        };
                      }
                      return api._put(ruleUrl, rule, filter);
                    },
                  };
                },
              }),
              runCommand: (commandName: string, data?: Record<string, any>) =>
                api._postUntyped(`${appUrl}/services/${serviceId}/commands/${commandName}`, data),
              update: (version: number) =>
                api
                  ._patchRaw(`${appUrl}/services/${serviceId}`, {
                    body: JSON.stringify({ version }),
                  })
                  .then((response) => response.text())
                  .then((response) => jsonConvert.deserializeObject(EJSON.parse(response), PartialServiceDesc)),
            }),
          }),

          pushNotifications: () => ({
            create: (request: SendNotificationRequest) =>
              api._post(`${appUrl}/push/notifications`, PushNotification, request),
            list: (state: MessageState) =>
              api._list(`${appUrl}/push/notifications`, PushNotification, {
                state,
              }),
            pushNotification: (messageId: string) => ({
              get: () => api._get(`${appUrl}/push/notifications/${messageId}`, PushNotification),
              remove: () => api._delete(`${appUrl}/push/notifications/${messageId}`),
              send: () => api._postUntyped(`${appUrl}/push/notifications/${messageId}/send`),
              update: (request: SendNotificationRequest) =>
                api._put(`${appUrl}/push/notifications/${messageId}`, request),
            }),
          }),

          users: () => ({
            count: (): Promise<number> => api._getUntyped(`${appUrl}/users_count`).then((result) => result as number),
            create: (request: EmailPasswordRegistrationRequest) => api._post(`${appUrl}/users`, PartialUser, request),
            list: (filter?: UserFilter) => {
              let queryFilter: Record<string, any>;
              if (filter) {
                queryFilter = {};
                if (filter.descending) {
                  queryFilter.desc = filter.descending;
                }
                if (filter.after) {
                  queryFilter.after = filter.after;
                }
                if (filter.providerTypes) {
                  queryFilter.provider_types = filter.providerTypes;
                }
                if (filter.sort) {
                  queryFilter.sort = filter.sort;
                }
                if (filter.limit) {
                  queryFilter.limit = filter.limit;
                }
              }
              return api._list(`${appUrl}/users`, PartialUser, filter);
            },
            user: (uid: string) => ({
              devices: () => ({
                get: () => api._list(`${appUrl}/users/${uid}/devices`, Device),
              }),
              disable: () => api._putRaw(`${appUrl}/users/${uid}/disable`),
              enable: () => api._putRaw(`${appUrl}/users/${uid}/enable`),
              get: () => api._get(`${appUrl}/users/${uid}`, User),
              logout: () => api._putRaw(`${appUrl}/users/${uid}/logout`),
              remove: () => api._delete(`${appUrl}/users/${uid}`),
            }),
          }),

          userRegistrations: () => ({
            confirmByEmail: (email: string) =>
              api._postUntyped(`${appUrl}/user_registrations/by_email/${email}/confirm`),
            listPending: (limit?: number, after?: string) => {
              let filter: Record<string, any> | undefined;
              if (limit || after) {
                filter = {};
                if (limit) {
                  filter.limit = limit;
                }
                if (after) {
                  filter.after = after;
                }
              }
              api._list(`${appUrl}/user_registrations/pending_users`, PasswordRecord, filter);
            },
            removePendingUserByEmail: (email: string) => api._delete(`${appUrl}/user_registrations/by_email/${email}`),
            removePendingUserByID: (id: string) => api._delete(`${appUrl}/user_registrations/by_id/${id}`),
            runUserConfirmation: (email: string) =>
              api._post(`${appUrl}/user_registrations/by_email/${email}/run_confirm`, UserActionToken),
            sendConfirmationEmail: (email: string) =>
              api._post(`${appUrl}/user_registrations/by_email/${email}/send_confirm`, UserActionToken),
          }),

          customUserData: () => ({
            get: () => api._get(`${appUrl}/custom_user_data`, CustomUserDataConfig),
            update: (config: CustomUserDataConfig) => api._patch(`${appUrl}/custom_user_data`, config),
          }),

          debug: () => ({
            executeFunction: (userId: string, name = '', ...args: any[]) =>
              api._postUntyped(`${appUrl}/debug/execute_function`, { name, arguments: args }, { user_id: userId }),
            executeFunctionSource: ({
              userId,
              source = '',
              evalSource = '',
              runAsSystem,
            }: {
              userId: string;
              source: string;
              evalSource: string;
              runAsSystem: boolean;
            }) =>
              api._postUntyped(
                `${appUrl}/debug/execute_function_source`,
                { source, eval_source: evalSource },
                { user_id: userId, run_as_system: runAsSystem }
              ),
          }),

          authProviders: () => ({
            authProvider: (providerId: string) => ({
              disable: () => api._putRaw(`${appUrl}/auth_providers/${providerId}/disable`),
              enable: () => api._putRaw(`${appUrl}/auth_providers/${providerId}/enable`),
              get: () => api._get(`${appUrl}/auth_providers/${providerId}`, AuthProviderConfig),
              remove: () => api._delete(`${appUrl}/auth_providers/${providerId}`),
              update: (config: AuthProviderConfig) => api._patch(`${appUrl}/auth_providers/${providerId}`, config),
            }),
            create: (config: AuthProviderConfig) =>
              api._post(`${appUrl}/auth_providers`, PartialAuthProviderConfig, config),
            list: () => api._list(`${appUrl}/auth_providers`, PartialAuthProviderConfig),
          }),

          security: () => ({
            allowedRequestOrigins: () => ({
              get: () => api._list(`${appUrl}/security/allowed_request_origins`, String),
              update: (origins: string[]) => api._postUntyped(`${appUrl}/security/allowed_request_origins`, origins),
            }),
          }),

          logs: () => ({
            list: (request?: AppLogRequest) => {
              let filter: Record<string, any> | undefined;
              if (request) {
                filter = {};
                if (request.endDate) {
                  filter.end_date = request.endDate;
                }
                if (request.startDate) {
                  filter.start_date = request.startDate;
                }
                if (request.type) {
                  filter.type = request.type;
                }
                if (request.userId) {
                  filter.user_id = request.userId;
                }
                if (request.errorsOnly) {
                  filter.errors_only = request.errorsOnly;
                }
                if (request.coId) {
                  filter.co_id = request.coId;
                }
                if (request.skip) {
                  filter.skip = request.skip;
                }
              }
              return api._get(`${appUrl}/logs`, AppLogResponse, filter);
            },
          }),

          apiKeys: () => ({
            apiKey: (apiKeyId: string) => ({
              disable: () => api._putRaw(`${appUrl}/api_keys/${apiKeyId}/disable`),
              enable: () => api._putRaw(`${appUrl}/api_keys/${apiKeyId}/enable`),
              get: () => api._get(`${appUrl}/api_keys/${apiKeyId}`, PartialAPIKey),
              remove: () => api._delete(`${appUrl}/api_keys/${apiKeyId}`),
            }),
            create: (key: APIKey) => api._post(`${appUrl}/api_keys`, APIKey, key),
            list: () => api._list(`${appUrl}/api_keys`, PartialAPIKey),
          }),

          functions: () => ({
            create: (func: AppFunction) => api._post(`${appUrl}/functions`, PartialAppFunction, func),
            function: (functionId: string) => ({
              get: () => api._get(`${appUrl}/functions/${functionId}`, AppFunction),
              remove: () => api._delete(`${appUrl}/functions/${functionId}`),
              update: (func: AppFunction) => api._put(`${appUrl}/functions/${functionId}`, func),
            }),
            list: () => api._list(`${appUrl}/functions`, PartialAppFunction),
          }),

          eventSubscriptions: () => ({
            create: (sub: EventSubscription) => api._post(`${appUrl}/event_subscriptions`, EventSubscription, sub),
            eventSubscription: (eventSubscriptionId: string) => ({
              get: () => api._get(`${appUrl}/event_subscriptions/${eventSubscriptionId}`, EventSubscription),
              remove: () => api._delete(`${appUrl}/event_subscriptions/${eventSubscriptionId}`),
              resume: (options: EventSubscriptionResumeOptions) =>
                api._put(`${appUrl}/event_subscriptions/${eventSubscriptionId}/resume`, options),
              update: (sub: EventSubscription) => api._put(`${appUrl}/event_subscriptions/${eventSubscriptionId}`, sub),
            }),
            list: (type?: ResourceType) => {
              let filter: Record<string, any> | undefined;
              if (type) {
                filter = { type };
              }
              return api._list(`${appUrl}/event_subscriptions`, EventSubscription, filter);
            },
          }),

          validationSettings: () => {
            const validationSettingsUrl = `${appUrl}/validation_settings`;

            return {
              graphql: () => {
                const graphqlUrl = `${validationSettingsUrl}/graphql`;

                return {
                  get: () => api._get(graphqlUrl, ValidationOptions),
                  update: (settings: ValidationOptions) => api._put(graphqlUrl, settings),
                };
              },
            };
          },

          graphql: () => {
            const graphqlUrl = `${appUrl}/graphql`;

            return {
              config: () => ({
                get: () => api._get(`${graphqlUrl}/config`, GraphQLConfig),
                update: (config: GraphQLConfig) => api._put(`${graphqlUrl}/config`, config),
              }),
              customResolvers: () => ({
                create: (resolver: CustomResolver) =>
                  api._post(`${graphqlUrl}/custom_resolvers`, CustomResolver, resolver),
                customResolver: (id: string) => ({
                  get: () => api._get(`${graphqlUrl}/custom_resolvers/${id}`, CustomResolver),
                  remove: () => api._delete(`${graphqlUrl}/custom_resolvers/${id}`),
                  update: (resolver: CustomResolver) => api._put(`${graphqlUrl}/custom_resolvers/${id}`, resolver),
                }),
                list: () => api._list(`${graphqlUrl}/custom_resolvers`, CustomResolver),
              }),
              post: (data: Record<string, any>) => api._postUntyped(`${graphqlUrl}`, data),
              validate: () => api._list(`${graphqlUrl}/validate`, GraphQLAlerts),
            };
          },

          sync: () => {
            const syncUrl = `${appUrl}/sync`;
            return {
              clientSchemas: () => {
                const realmClientSchemasUrl = `${syncUrl}/client_schemas`;
                return {
                  get: (language: string, namespaces?: string[]) => {
                    let filter: Record<string, any> | undefined;
                    if (namespaces && namespaces.length > 0) {
                      filter = { namespace: namespaces };
                    }
                    return api._list(`${realmClientSchemasUrl}/${language}`, SyncClientSchema, filter);
                  },
                };
              },
              config: () => {
                const realmConfigUrl = `${syncUrl}/config`;
                return {
                  get: () => api._get(realmConfigUrl, SyncConfig),
                  update: (config: SyncConfig) => api._put(realmConfigUrl, config),
                };
              },
              data: (serviceId?: string) => {
                let filter: Record<string, any> | undefined;
                if (serviceId) {
                  filter = { service_id: serviceId };
                }
                return api._get(`${syncUrl}/data`, SyncData, filter);
              },
              progress: () => api._get(`${syncUrl}/progress`, SyncProgress),
              schemas: () => ({
                patch: (request: PatchSyncSchemasRequest) => api._patch(`${syncUrl}/schemas`, request),
              }),
            };
          },
        };
      },
      create: (request: CreateAppRequest) => {
        const query = request.product ? `?product=${request.product}` : '';
        return api._post(groupUrl + query, PartialApp, request);
      },

      list: (product?: string) => api._list(groupUrl, PartialApp, product ? { product } : undefined),
    };
  }

  public private() {
    const privateApi = this._private;
    return {
      admin: () => ({
        group: (groupId: string) => ({
          app: (appId: string) => {
            const adminUrl = `/admin/groups/${groupId}/apps/${appId}`;
            return {
              triggers: () => {
                const triggersUrl = `${adminUrl}/triggers`;
                return {
                  get: (triggerId: string) => privateApi._get(`${triggersUrl}/${triggerId}`, AdminEventSubscription),
                  list: () => privateApi._list(triggersUrl, AdminEventSubscription),
                };
              },
            };
          },
        }),
      }),
      auth: () => ({
        tempAPIKeys: () => {
          const apiKeysUrl = '/auth/temp_api_keys';
          return {
            create: (request: CreateTempAPIKeyRequest) =>
              privateApi._post(apiKeysUrl, CreateTempAPIKeyResponse, request),
          };
        },
      }),
      group: (groupId: string) => {
        const groupUrl = `/groups/${groupId}`;
        return {
          app: (appId: string) => {
            const appUrl = `${groupUrl}/apps/${appId}`;
            return {
              atlasClusters: () => {
                const clustersUrl = `${appUrl}/atlas_clusters`;
                return {
                  create: (regionName: string) =>
                    privateApi._post(
                      clustersUrl,
                      CreateAtlasClusterResponse,
                      new CreateAtlasClusterRequest({ regionName }),
                      undefined,
                      { credentials: 'include' }
                    ),
                };
              },
            };
          },
          atlasClusters: () => {
            const clustersUrl = `${groupUrl}/atlas_clusters`;
            return {
              list: () => privateApi._list(clustersUrl, AtlasCluster),
            };
          },
          get: () => privateApi._get(groupUrl, AtlasGroup),
        };
      },
      spa: () => ({
        recaptcha: () => ({
          verify: (token: string) =>
            privateApi._postRaw(`/spa/recaptcha/verify`, {
              credentials: 'include',
              multipart: true,
              noAuth: true,
              queryParams: { response: token },
            }),
        }),
        settings: () => ({
          global: () => privateApi._getUntyped(`/spa/settings/global`),
        }),
      }),
    };
  }

  private apiMethods(apiType: string, apiVersion: number) {
    const doRequest = (url: string, method: string, options?: FetchOptions) =>
      this._do(url, method, { apiType, apiVersion, ...options });

    const doJSON = (url: string, method: string, options?: FetchOptions) =>
      doRequest(url, method, options).then((response) => {
        const contentHeader = response.headers.get('content-type') || '';
        if (contentHeader.split(',').indexOf('application/json') >= 0) {
          return response.json();
        }
        return response;
      });

    const doText = (url: string, method: string, options?: FetchOptions) =>
      doRequest(url, method, options).then((response) => response.text());

    const doTyped = <T, U>(url: string, method: string, resultType: new () => U, data?: T, options?: FetchOptions) => {
      if (data) {
        if (!options) {
          options = {};
        }
        options.body = JSON.stringify(jsonConvert.serialize(data));
      }
      return doText(url, method, options).then((response) =>
        jsonConvert.deserializeObject(EJSON.parse(response), resultType)
      );
    };

    const doTypedNoContent = <T>(url: string, method: string, data?: T, options?: FetchOptions) => {
      if (data) {
        if (!options) {
          options = {};
        }
        options.body = JSON.stringify(jsonConvert.serialize(data));
      }
      return doJSON(url, method, options);
    };

    const doTypedList = <T, U>(
      url: string,
      method: string,
      resultType: new () => U,
      data?: T,
      options?: FetchOptions
    ) => {
      if (data) {
        if (!options) {
          options = {};
        }
        options.body = JSON.stringify(jsonConvert.serialize(data));
      }
      return doText(url, method, options).then((response) =>
        Object.values(EJSON.parse(response)).map((val: any) => jsonConvert.deserializeObject(val, resultType))
      );
    };

    return {
      _delete: (url: string, queryParams?: Record<string, any>) =>
        doJSON(url, 'DELETE', queryParams ? { queryParams } : undefined),
      _get: <T>(
        url: string,
        resultType: new () => T,
        queryParams?: Record<string, any>,
        headers?: Record<string, string>,
        options?: FetchOptions
      ) =>
        doTyped(url, 'GET', resultType, undefined, {
          headers,
          queryParams,
          ...options,
        }),
      _getConvert: <T>(
        converter: (response: any) => T,
        url: string,
        queryParams?: Record<string, any>,
        headers?: Record<string, string>,
        options?: FetchOptions
      ) =>
        doText(url, 'GET', {
          headers,
          queryParams,
          ...options,
        }).then((response) => converter(EJSON.parse(response))),
      _getUntyped: <T>(
        url: string,
        queryParams?: Record<string, any>,
        headers?: Record<string, string>,
        options?: FetchOptions
      ) => doJSON(url, 'GET', { queryParams, headers, ...options }),
      _list: <T>(
        url: string,
        resultType: new () => T,
        queryParams?: Record<string, any>,
        headers?: Record<string, string>,
        options?: FetchOptions
      ) =>
        doTypedList(url, 'GET', resultType, undefined, {
          headers,
          queryParams,
          ...options,
        }),
      _listConvert: <T>(
        url: string,
        converter: (response: any) => T,
        queryParams?: Record<string, any>,
        headers?: Record<string, string>,
        options?: FetchOptions
      ) =>
        doText(url, 'GET', {
          headers,
          queryParams,
          ...options,
        }).then((response) => Object.values(EJSON.parse(response)).map((val: any) => converter(val))),
      _patch: <T>(url: string, data: T) => doTypedNoContent(url, 'PATCH', data),
      _patchRaw: (url: string, options?: FetchOptions) => doJSON(url, 'PATCH', options),
      _post: <T, U>(
        url: string,
        resultType: new () => U,
        data?: T,
        queryParams?: Record<string, any>,
        options?: FetchOptions
      ) => doTyped(url, 'POST', resultType, data, { queryParams, ...options }),
      _postConvert: <T, U>(url: string, data: U, converter: (response: any) => T, queryParams?: Record<string, any>) =>
        doText(url, 'POST', {
          body: JSON.stringify(jsonConvert.serialize(data)),
          queryParams,
        }).then((response) => converter(EJSON.parse(response))),
      _postNoContent: <U>(url: string, data: U, queryParams?: Record<string, any>) =>
        doTypedNoContent(url, 'POST', data, { queryParams }),
      _postRaw: (url: string, options?: FetchOptions) => doJSON(url, 'POST', options),
      _postUntyped: (url: string, body?: Record<string, any>, queryParams?: Record<string, any>) =>
        doJSON(url, 'POST', {
          body: body ? JSON.stringify(body) : undefined,
          queryParams,
        }),
      _put: <T>(url: string, data: T, queryParams?: Record<string, any>, options?: FetchOptions) =>
        doTypedNoContent(url, 'PUT', data, { queryParams, ...options }),
      _putRaw: (url: string, options?: FetchOptions) => doJSON(url, 'PUT', options),
    };
  }
}
