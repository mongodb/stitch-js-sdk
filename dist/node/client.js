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

var _errors = require('./errors');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    this.authManager = new _auth2.default(this.authUrl);
    this.authManager.handleRedirect();
    this.authManager.handleCookie();
  }

  /**
   * Sends the user to the OAuth flow for the specified third-party service.
   *
   * @param {*} providerName The OAuth provider name.
   * @param {*} redirectUrl The redirect URL to use after the flow completes.
   */


  _createClass(StitchClient, [{
    key: 'authWithOAuth',
    value: function authWithOAuth(providerName, redirectUrl) {
      window.location.replace(this.authManager.getOAuthLoginURL(providerName, redirectUrl));
    }

    /**
     * Generates a URL that can be used to initiate an OAuth login flow with the specified OAuth provider.
     *
     * @param {*} providerName The OAuth provider name.
     * @param {*} redirectUrlThe redirect URL to use after the flow completes.
     */

  }, {
    key: 'getOAuthLoginURL',
    value: function getOAuthLoginURL(providerName, redirectUrl) {
      return this.authManager.getOAuthLoginURL(providerName, redirectUrl);
    }

    /**
     * Logs in as an anonymous user.
     */

  }, {
    key: 'anonymousAuth',
    value: function anonymousAuth() {
      return this.authManager.anonymousAuth();
    }

    /**
     *  @return {String} Returns the currently authed user's ID.
     */

  }, {
    key: 'authedId',
    value: function authedId() {
      return this.authManager.authedId();
    }

    /**
     * @return {Object} Returns the currently authed user's authentication information.
     */

  }, {
    key: 'auth',
    value: function auth() {
      return this.authManager.get();
    }

    /**
     * @return {*} Returns any error from the Stitch authentication system.
     */

  }, {
    key: 'authError',
    value: function authError() {
      return this.authManager.error();
    }

    /**
     * Ends the session for the current user.
     */

  }, {
    key: 'logout',
    value: function logout() {
      var _this = this;

      return this._do('/auth', 'DELETE', { refreshOnFailure: false, useRefreshToken: true }).then(function () {
        return _this.authManager.clear();
      });
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
      var _this2 = this;

      options = Object.assign({}, {
        refreshOnFailure: true,
        useRefreshToken: false
      }, options);

      if (!options.noAuth) {
        if (this.auth() === null) {
          return Promise.reject(new _errors.StitchError('Must auth first', _errors.ErrUnauthorized));
        }
      }

      var url = '' + this.appUrl + resource;
      var fetchArgs = common.makeFetchArgs(method, options.body);

      if (!!options.headers) {
        Object.assign(fetchArgs.headers, options.headers);
      }

      if (!options.noAuth) {
        var token = options.useRefreshToken ? this.authManager.getRefreshToken() : this.auth().accessToken;
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
                _this2.authManager.clear();
                var _error = new _errors.StitchError(json.error, json.errorCode);
                _error.response = response;
                _error.json = json;
                throw _error;
              }

              return _this2._refreshToken().then(function () {
                options.refreshOnFailure = false;
                return _this2._do(resource, method, options);
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
  }, {
    key: '_refreshToken',
    value: function _refreshToken() {
      var _this3 = this;

      if (this.authManager.isImpersonatingUser()) {
        return this.authManager.refreshImpersonation(this);
      }

      return this._do('/auth/newAccessToken', 'POST', { refreshOnFailure: false, useRefreshToken: true }).then(function (response) {
        return response.json();
      }).then(function (json) {
        return _this3.authManager.setAccessToken(json.accessToken);
      });
    }
  }]);

  return StitchClient;
}();

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
                          return _this5._post('/groups/' + groupId + '/apps/' + appID + '/services/' + svc + '/incomingWebhooks');
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
      return this.client.authManager.isImpersonatingUser();
    }
  }, {
    key: '_startImpersonation',
    value: function _startImpersonation(userId) {
      return this.client.authManager.startImpersonation(this.client, userId);
    }
  }, {
    key: '_stopImpersonation',
    value: function _stopImpersonation() {
      return this.client.authManager.stopImpersonation();
    }
  }]);

  return Admin;
}();

exports.StitchClient = StitchClient;
exports.Admin = Admin;