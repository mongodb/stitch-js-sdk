'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Admin = exports.StitchClient = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global window, fetch */
/* eslint no-labels: ['error', { 'allowLoop': true }] */


require('fetch-everywhere');

var _auth = require('./auth');

var _auth2 = _interopRequireDefault(_auth);

var _services = require('./services');

var _services2 = _interopRequireDefault(_services);

var _common = require('./common');

var common = _interopRequireWildcard(_common);

var _mongodbExtjson = require('mongodb-extjson');

var _mongodbExtjson2 = _interopRequireDefault(_mongodbExtjson);

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

var _util = require('./util');

var _errors = require('./errors');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EJSON = new _mongodbExtjson2.default();

/**
 * Create a new StitchClient instance.
 *
 * @class
 * @return {StitchClient} a StitchClient instance.
 */

var StitchClient = function () {
  function StitchClient(clientAppID, options) {
    var _this = this;

    _classCallCheck(this, StitchClient);

    var baseUrl = common.DEFAULT_STITCH_SERVER_URL;
    if (options && options.baseUrl) {
      baseUrl = options.baseUrl;
    }

    this.appUrl = baseUrl + '/api/public/v1.0';
    this.authUrl = baseUrl + '/api/public/v1.0/auth';
    if (clientAppID) {
      this.appUrl = baseUrl + '/api/client/v1.0/app/' + clientAppID;
      this.authUrl = this.appUrl + '/auth';
    }

    this.auth = new _auth2.default(this, this.authUrl);
    this.auth.handleRedirect();
    this.auth.handleCookie();

    // deprecated API
    this.authManager = {
      apiKeyAuth: function apiKeyAuth(key) {
        return _this.authenticate('apiKey', key);
      },
      localAuth: function localAuth(email, password) {
        return _this.login(email, password);
      },
      mongodbCloudAuth: function mongodbCloudAuth(username, apiKey, opts) {
        return _this.authenticate('mongodbCloud', Object.assign({ username: username, apiKey: apiKey }, opts));
      }
    };

    this.authManager.apiKeyAuth = (0, _util.deprecate)(this.authManager.apiKeyAuth, 'use `client.authenticate("apiKey", "key")` instead of `client.authManager.apiKey`');
    this.authManager.localAuth = (0, _util.deprecate)(this.authManager.localAuth, 'use `client.login` instead of `client.authManager.localAuth`');
    this.authManager.mongodbCloudAuth = (0, _util.deprecate)(this.authManager.mongodbCloudAuth, 'use `client.authenticate("mongodbCloud", opts)` instead of `client.authManager.mongodbCloudAuth`');
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


  _createClass(StitchClient, [{
    key: 'login',
    value: function login(email, password) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

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

  }, {
    key: 'register',
    value: function register(email, password) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      return this.auth.provider('userpass').register(email, password, options);
    }

    /**
     * Starts an OAuth authorization flow by opening a popup window
     *
     * @param {String} providerType the provider used for authentication (e.g. 'facebook', 'google')
     * @param {Object} [options] additional authentication options (user data)
     * @returns {Promise}
     */

  }, {
    key: 'authenticate',
    value: function authenticate(providerType, options) {
      return this.auth.provider(providerType).authenticate(options);
    }

    /**
     * Ends the session for the current user.
     *
     * @returns {Promise}
     */

  }, {
    key: 'logout',
    value: function logout() {
      var _this2 = this;

      return this._do('/auth', 'DELETE', { refreshOnFailure: false, useRefreshToken: true }).then(function () {
        return _this2.auth.clear();
      });
    }

    /**
     * @return {*} Returns any error from the Stitch authentication system.
     */

  }, {
    key: 'authError',
    value: function authError() {
      return this.auth.error();
    }

    /**
     * Returns profile information for the currently logged in user
     *
     * @returns {Promise}
     */

  }, {
    key: 'userProfile',
    value: function userProfile() {
      return this._do('/auth/me', 'GET').then(function (response) {
        return response.json();
      });
    }

    /**
     *  @return {String} Returns the currently authed user's ID.
     */

  }, {
    key: 'authedId',
    value: function authedId() {
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

  }, {
    key: 'service',
    value: function service(type, name) {
      if (this.constructor !== StitchClient) {
        throw new _errors.StitchError('`service` is a factory method, do not use `new`');
      }

      if (!_services2.default.hasOwnProperty(type)) {
        throw new _errors.StitchError('Invalid service type specified: ' + type);
      }

      var ServiceType = _services2.default[type];
      return new ServiceType(this, name);
    }

    /**
     * Executes a named pipeline.
     *
     * @param {String} name Name of the named pipeline to execute.
     * @param {Object} args Arguments to the named pipeline to execute.
     * @param {Object} [options] Additional options to pass to the execution context.
     */

  }, {
    key: 'executeNamedPipeline',
    value: function executeNamedPipeline(name, args) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var namedPipelineVar = 'namedPipelineOutput';
      var namedPipelineStages = [{
        action: 'literal',
        args: {
          items: ['%%vars.' + namedPipelineVar]
        },
        let: _defineProperty({}, namedPipelineVar, {
          '%pipeline': { name: name, args: args }
        })
      }];
      return this.executePipeline(namedPipelineStages, options);
    }

    /**
     * Executes a service pipeline.
     *
     * @param {Array} stages Stages to process.
     * @param {Object} [options] Additional options to pass to the execution context.
     */

  }, {
    key: 'executePipeline',
    value: function executePipeline(stages) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var responseDecoder = function responseDecoder(d) {
        return EJSON.parse(d, { strict: false });
      };
      var responseEncoder = function responseEncoder(d) {
        return EJSON.stringify(d);
      };
      stages = Array.isArray(stages) ? stages : [stages];
      stages = stages.reduce(function (acc, stage) {
        return acc.concat(stage);
      }, []);

      if (options.decoder) {
        if (typeof options.decoder !== 'function') {
          throw new Error('decoder option must be a function, but "' + _typeof(options.decoder) + '" was provided');
        }
        responseDecoder = options.decoder;
      }

      if (options.encoder) {
        if (typeof options.encoder !== 'function') {
          throw new Error('encoder option must be a function, but "' + _typeof(options.encoder) + '" was provided');
        }
        responseEncoder = options.encoder;
      }

      return this._do('/pipeline', 'POST', { body: responseEncoder(stages) }).then(function (response) {
        return response.text();
      }).then(function (body) {
        return responseDecoder(body);
      });
    }
  }, {
    key: '_do',
    value: function _do(resource, method, options) {
      var _this3 = this;

      options = Object.assign({}, {
        refreshOnFailure: true,
        useRefreshToken: false
      }, options);

      if (!options.noAuth) {
        if (!this.authedId()) {
          return Promise.reject(new _errors.StitchError('Must auth first', _errors.ErrUnauthorized));
        }
      }

      var url = '' + this.appUrl + resource;
      var fetchArgs = common.makeFetchArgs(method, options.body);

      if (!!options.headers) {
        Object.assign(fetchArgs.headers, options.headers);
      }

      if (!options.noAuth) {
        var token = options.useRefreshToken ? this.auth.getRefreshToken() : this.auth.getAccessToken();
        fetchArgs.headers.Authorization = 'Bearer ' + token;
      }

      if (options.queryParams) {
        url = url + '?' + _queryString2.default.stringify(options.queryParams);
      }

      return fetch(url, fetchArgs).then(function (response) {
        // Okay: passthrough
        if (response.status >= 200 && response.status < 300) {
          return Promise.resolve(response);
        }

        if (response.headers.get('Content-Type') === common.JSONTYPE) {
          return response.json().then(function (json) {
            // Only want to try refreshing token when there's an invalid session
            if ('errorCode' in json && json.errorCode === _errors.ErrInvalidSession) {
              if (!options.refreshOnFailure) {
                _this3.auth.clear();
                var _error = new _errors.StitchError(json.error, json.errorCode);
                _error.response = response;
                _error.json = json;
                throw _error;
              }

              return _this3.auth.refreshToken().then(function () {
                options.refreshOnFailure = false;
                return _this3._do(resource, method, options);
              });
            }

            var error = new _errors.StitchError(json.error, json.errorCode);
            error.response = response;
            error.json = json;
            return Promise.reject(error);
          });
        }

        var error = new Error(response.statusText);
        error.response = response;
        return Promise.reject(error);
      });
    }

    // Deprecated API

  }, {
    key: 'authWithOAuth',
    value: function authWithOAuth(providerType, redirectUrl) {
      return this.auth.provider(providerType).authenticate({ redirectUrl: redirectUrl });
    }
  }, {
    key: 'anonymousAuth',
    value: function anonymousAuth() {
      return this.login();
    }
  }]);

  return StitchClient;
}();

StitchClient.prototype.authWithOAuth = (0, _util.deprecate)(StitchClient.prototype.authWithOAuth, 'use `authenticate` instead of `authWithOAuth`');
StitchClient.prototype.anonymousAuth = (0, _util.deprecate)(StitchClient.prototype.anonymousAuth, 'use `login()` instead of `anonymousAuth`');

var Admin = function () {
  function Admin(baseUrl) {
    _classCallCheck(this, Admin);

    this.client = new StitchClient('', { baseUrl: baseUrl });
  }

  _createClass(Admin, [{
    key: '_do',
    value: function _do(url, method, options) {
      return this.client._do(url, method, options).then(function (response) {
        return response.json();
      });
    }
  }, {
    key: '_get',
    value: function _get(url, queryParams) {
      return this._do(url, 'GET', { queryParams: queryParams });
    }
  }, {
    key: '_put',
    value: function _put(url, options) {
      return this._do(url, 'PUT', options);
    }
  }, {
    key: '_delete',
    value: function _delete(url) {
      return this._do(url, 'DELETE');
    }
  }, {
    key: '_post',
    value: function _post(url, body) {
      return this._do(url, 'POST', { body: JSON.stringify(body) });
    }
  }, {
    key: 'profile',
    value: function profile() {
      var _this4 = this;

      var root = this;
      return {
        keys: function keys() {
          return {
            list: function list() {
              return root._get('/profile/keys');
            },
            create: function create(key) {
              return root._post('/profile/keys');
            },
            apiKey: function apiKey(keyId) {
              return {
                get: function get() {
                  return root._get('/profile/keys/' + keyId);
                },
                remove: function remove() {
                  return _this4._delete('/profile/keys/' + keyId);
                },
                enable: function enable() {
                  return root._put('/profile/keys/' + keyId + '/enable');
                },
                disable: function disable() {
                  return root._put('/profile/keys/' + keyId + '/disable');
                }
              };
            }
          };
        }
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

  }, {
    key: 'apps',
    value: function apps(groupId) {
      var _this5 = this;

      var root = this;
      return {
        list: function list() {
          return root._get('/groups/' + groupId + '/apps');
        },
        create: function create(data, options) {
          var query = options && options.defaults ? '?defaults=true' : '';
          return root._post('/groups/' + groupId + '/apps' + query, data);
        },

        app: function app(appID) {
          return {
            get: function get() {
              return root._get('/groups/' + groupId + '/apps/' + appID);
            },
            remove: function remove() {
              return root._delete('/groups/' + groupId + '/apps/' + appID);
            },
            replace: function replace(doc) {
              return root._put('/groups/' + groupId + '/apps/' + appID, {
                headers: { 'X-Stitch-Unsafe': appID },
                body: JSON.stringify(doc)
              });
            },

            messages: function messages() {
              return {
                list: function list(filter) {
                  return _this5._get('/groups/' + groupId + '/apps/' + appID + '/push/messages', filter);
                },
                create: function create(msg) {
                  return _this5._put('/groups/' + groupId + '/apps/' + appID + '/push/messages', { body: JSON.stringify(msg) });
                },
                message: function message(id) {
                  return {
                    get: function get() {
                      return _this5._get('/groups/' + groupId + '/apps/' + appID + '/push/messages/' + id);
                    },
                    remove: function remove() {
                      return _this5._delete('/groups/' + groupId + '/apps/' + appID + '/push/messages/' + id);
                    },
                    setSaveType: function setSaveType(type) {
                      return _this5._post('/groups/' + groupId + '/apps/' + appID + '/push/messages/' + id, { type: type });
                    },
                    update: function update(msg) {
                      return _this5._put('/groups/' + groupId + '/apps/' + appID + '/push/messages/' + id, { body: JSON.stringify(msg) });
                    }
                  };
                }
              };
            },

            users: function users() {
              return {
                list: function list(filter) {
                  return _this5._get('/groups/' + groupId + '/apps/' + appID + '/users', filter);
                },
                create: function create(user) {
                  return _this5._post('/groups/' + groupId + '/apps/' + appID + '/users', user);
                },
                user: function user(uid) {
                  return {
                    get: function get() {
                      return _this5._get('/groups/' + groupId + '/apps/' + appID + '/users/' + uid);
                    },
                    logout: function logout() {
                      return _this5._put('/groups/' + groupId + '/apps/' + appID + '/users/' + uid + '/logout');
                    }
                  };
                }
              };
            },

            sandbox: function sandbox() {
              return {
                executePipeline: function executePipeline(data, userId, options) {
                  var queryParams = Object.assign({}, options, { user_id: userId });
                  return _this5._do('/groups/' + groupId + '/apps/' + appID + '/sandbox/pipeline', 'POST', { body: JSON.stringify(data), queryParams: queryParams });
                }
              };
            },

            authProviders: function authProviders() {
              return {
                create: function create(data) {
                  return _this5._post('/groups/' + groupId + '/apps/' + appID + '/authProviders', data);
                },
                list: function list() {
                  return _this5._get('/groups/' + groupId + '/apps/' + appID + '/authProviders');
                },
                provider: function provider(authType, authName) {
                  return {
                    get: function get() {
                      return _this5._get('/groups/' + groupId + '/apps/' + appID + '/authProviders/' + authType + '/' + authName);
                    },
                    remove: function remove() {
                      return _this5._delete('/groups/' + groupId + '/apps/' + appID + '/authProviders/' + authType + '/' + authName);
                    },
                    update: function update(data) {
                      return _this5._post('/groups/' + groupId + '/apps/' + appID + '/authProviders/' + authType + '/' + authName, data);
                    }
                  };
                }
              };
            },
            security: function security() {
              return {
                allowedRequestOrigins: function allowedRequestOrigins() {
                  return {
                    get: function get() {
                      return _this5._get('/groups/' + groupId + '/apps/' + appID + '/security/allowedRequestOrigins');
                    },
                    update: function update(data) {
                      return _this5._post('/groups/' + groupId + '/apps/' + appID + '/security/allowedRequestOrigins', data);
                    }
                  };
                }
              };
            },
            values: function values() {
              return {
                list: function list() {
                  return _this5._get('/groups/' + groupId + '/apps/' + appID + '/values');
                },
                value: function value(varName) {
                  return {
                    get: function get() {
                      return _this5._get('/groups/' + groupId + '/apps/' + appID + '/values/' + varName);
                    },
                    remove: function remove() {
                      return _this5._delete('/groups/' + groupId + '/apps/' + appID + '/values/' + varName);
                    },
                    create: function create(data) {
                      return _this5._post('/groups/' + groupId + '/apps/' + appID + '/values/' + varName, data);
                    },
                    update: function update(data) {
                      return _this5._post('/groups/' + groupId + '/apps/' + appID + '/values/' + varName, data);
                    }
                  };
                }
              };
            },
            pipelines: function pipelines() {
              return {
                list: function list() {
                  return _this5._get('/groups/' + groupId + '/apps/' + appID + '/pipelines');
                },
                pipeline: function pipeline(varName) {
                  return {
                    get: function get() {
                      return _this5._get('/groups/' + groupId + '/apps/' + appID + '/pipelines/' + varName);
                    },
                    remove: function remove() {
                      return _this5._delete('/groups/' + groupId + '/apps/' + appID + '/pipelines/' + varName);
                    },
                    create: function create(data) {
                      return _this5._post('/groups/' + groupId + '/apps/' + appID + '/pipelines/' + varName, data);
                    },
                    update: function update(data) {
                      return _this5._post('/groups/' + groupId + '/apps/' + appID + '/pipelines/' + varName, data);
                    }
                  };
                }
              };
            },
            logs: function logs() {
              return {
                get: function get(filter) {
                  return _this5._get('/groups/' + groupId + '/apps/' + appID + '/logs', filter);
                }
              };
            },
            apiKeys: function apiKeys() {
              return {
                list: function list() {
                  return _this5._get('/groups/' + groupId + '/apps/' + appID + '/keys');
                },
                create: function create(data) {
                  return _this5._post('/groups/' + groupId + '/apps/' + appID + '/keys', data);
                },
                apiKey: function apiKey(key) {
                  return {
                    get: function get() {
                      return _this5._get('/groups/' + groupId + '/apps/' + appID + '/keys/' + key);
                    },
                    remove: function remove() {
                      return _this5._delete('/groups/' + groupId + '/apps/' + appID + '/keys/' + key);
                    },
                    enable: function enable() {
                      return _this5._put('/groups/' + groupId + '/apps/' + appID + '/keys/' + key + '/enable');
                    },
                    disable: function disable() {
                      return _this5._put('/groups/' + groupId + '/apps/' + appID + '/keys/' + key + '/disable');
                    }
                  };
                }
              };
            },
            services: function services() {
              return {
                list: function list() {
                  return _this5._get('/groups/' + groupId + '/apps/' + appID + '/services');
                },
                create: function create(data) {
                  return _this5._post('/groups/' + groupId + '/apps/' + appID + '/services', data);
                },
                service: function service(svc) {
                  return {
                    get: function get() {
                      return _this5._get('/groups/' + groupId + '/apps/' + appID + '/services/' + svc);
                    },
                    update: function update(data) {
                      return _this5._post('/groups/' + groupId + '/apps/' + appID + '/services/' + svc, data);
                    },
                    remove: function remove() {
                      return _this5._delete('/groups/' + groupId + '/apps/' + appID + '/services/' + svc);
                    },
                    setConfig: function setConfig(data) {
                      return _this5._post('/groups/' + groupId + '/apps/' + appID + '/services/' + svc + '/config', data);
                    },

                    rules: function rules() {
                      return {
                        list: function list() {
                          return _this5._get('/groups/' + groupId + '/apps/' + appID + '/services/' + svc + '/rules');
                        },
                        create: function create(data) {
                          return _this5._post('/groups/' + groupId + '/apps/' + appID + '/services/' + svc + '/rules');
                        },
                        rule: function rule(ruleId) {
                          return {
                            get: function get() {
                              return _this5._get('/groups/' + groupId + '/apps/' + appID + '/services/' + svc + '/rules/' + ruleId);
                            },
                            update: function update(data) {
                              return _this5._post('/groups/' + groupId + '/apps/' + appID + '/services/' + svc + '/rules/' + ruleId, data);
                            },
                            remove: function remove() {
                              return _this5._delete('/groups/' + groupId + '/apps/' + appID + '/services/' + svc + '/rules/' + ruleId);
                            }
                          };
                        }
                      };
                    },

                    incomingWebhooks: function incomingWebhooks() {
                      return {
                        list: function list() {
                          return _this5._get('/groups/' + groupId + '/apps/' + appID + '/services/' + svc + '/incomingWebhooks');
                        },
                        create: function create(data) {
                          return _this5._post('/groups/' + groupId + '/apps/' + appID + '/services/' + svc + '/incomingWebhooks', data);
                        },
                        incomingWebhook: function incomingWebhook(incomingWebhookId) {
                          return {
                            get: function get() {
                              return _this5._get('/groups/' + groupId + '/apps/' + appID + '/services/' + svc + '/incomingWebhooks/' + incomingWebhookId);
                            },
                            update: function update(data) {
                              return _this5._post('/groups/' + groupId + '/apps/' + appID + '/services/' + svc + '/incomingWebhooks/' + incomingWebhookId, data);
                            },
                            remove: function remove() {
                              return _this5._delete('/groups/' + groupId + '/apps/' + appID + '/services/' + svc + '/incomingWebhooks/' + incomingWebhookId);
                            }
                          };
                        }
                      };
                    }
                  };
                }
              };
            }
          };
        }
      };
    }
  }, {
    key: '_admin',
    value: function _admin() {
      var _this6 = this;

      return {
        logs: function logs() {
          return {
            get: function get(filter) {
              return _this6._do('/admin/logs', 'GET', { useRefreshToken: true, queryParams: filter });
            }
          };
        },
        users: function users() {
          return {
            list: function list(filter) {
              return _this6._do('/admin/users', 'GET', { useRefreshToken: true, queryParams: filter });
            },
            user: function user(uid) {
              return {
                logout: function logout() {
                  return _this6._do('/admin/users/' + uid + '/logout', 'PUT', { useRefreshToken: true });
                }
              };
            }
          };
        }
      };
    }
  }, {
    key: '_isImpersonatingUser',
    value: function _isImpersonatingUser() {
      return this.client.auth.isImpersonatingUser();
    }
  }, {
    key: '_startImpersonation',
    value: function _startImpersonation(userId) {
      return this.client.auth.startImpersonation(this.client, userId);
    }
  }, {
    key: '_stopImpersonation',
    value: function _stopImpersonation() {
      return this.client.auth.stopImpersonation();
    }
  }]);

  return Admin;
}();

exports.StitchClient = StitchClient;
exports.Admin = Admin;