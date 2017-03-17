'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Admin = exports.MongoClient = exports.BaasClient = exports.toQueryString = exports.ErrUnauthorized = exports.ErrInvalidSession = exports.ErrAuthProviderNotFound = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _auth = require('./auth');

var _auth2 = _interopRequireDefault(_auth);

var _common = require('./common');

var common = _interopRequireWildcard(_common);

var _textEncodingUtf = require('text-encoding-utf-8');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global window, fetch */
/* eslint no-labels: ['error', { 'allowLoop': true }] */
require('isomorphic-fetch');

var ErrAuthProviderNotFound = exports.ErrAuthProviderNotFound = 'AuthProviderNotFound';
var ErrInvalidSession = exports.ErrInvalidSession = 'InvalidSession';
var ErrUnauthorized = exports.ErrUnauthorized = 'Unauthorized';

var EJSON = require('mongodb-extjson');

var toQueryString = exports.toQueryString = function toQueryString(obj) {
  var parts = [];
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      parts.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]));
    }
  }
  return parts.join('&');
};

var BaasClient = exports.BaasClient = function () {
  function BaasClient(clientAppID, options) {
    _classCallCheck(this, BaasClient);

    var baseUrl = common.DEFAULT_BAAS_SERVER_URL;
    if (options && options.baseUrl) {
      baseUrl = options.baseUrl;
    }
    this.appUrl = baseUrl + '/admin/v1';
    this.authUrl = baseUrl + '/admin/v1/auth';
    if (clientAppID) {
      this.appUrl = baseUrl + '/v1/app/' + clientAppID;
      this.authUrl = this.appUrl + '/auth';
    }
    this.authManager = new _auth2.default(this.authUrl);
    this.authManager.handleRedirect();
  }

  _createClass(BaasClient, [{
    key: 'authWithOAuth',
    value: function authWithOAuth(providerName, redirectUrl) {
      window.location.replace(this.authManager.getOAuthLoginURL(providerName, redirectUrl));
    }
  }, {
    key: 'getOAuthLoginURL',
    value: function getOAuthLoginURL(providerName, redirectUrl) {
      return this.authManager.getOAuthLoginURL(providerName, redirectUrl);
    }
  }, {
    key: 'anonymousAuth',
    value: function anonymousAuth() {
      return this.client.authManager.stopImpersonation();
    }
  }, {
    key: 'authedId',
    value: function authedId() {
      return this.authManager.authedId();
    }
  }, {
    key: 'auth',
    value: function auth() {
      return this.authManager.get();
    }
  }, {
    key: 'authError',
    value: function authError() {
      return this.authManager.error();
    }
  }, {
    key: 'logout',
    value: function logout() {
      var _this = this;

      return this._do('/auth', 'DELETE', { refreshOnFailure: false, useRefreshToken: true }).then(function () {
        return _this.authManager.clear();
      });
    }
  }, {
    key: '_do',
    value: function _do(resource, method, options) {
      var _this2 = this;

      if (!options) {
        options = {};
      }
      if (options.refreshOnFailure === undefined) {
        options.refreshOnFailure = true;
      }
      if (options.useRefreshToken === undefined) {
        options.useRefreshToken = false;
      }
      if (!options.noAuth) {
        if (this.auth() === null) {
          return Promise.reject(new common.BaasError('Must auth first', ErrUnauthorized));
        }
      }

      var url = '' + this.appUrl + resource;
      var fetchArgs = common.makeFetchArgs(method, options.body);
      if (!options.noAuth) {
        var token = options.useRefreshToken ? this.authManager.getRefreshToken() : this.auth()['accessToken'];
        fetchArgs.headers['Authorization'] = 'Bearer ' + token;
      }
      if (options.queryParams) {
        url = url + '?' + toQueryString(options.queryParams);
      }

      return fetch(url, fetchArgs).then(function (response) {
        // Okay: passthrough
        if (response.status >= 200 && response.status < 300) {
          return Promise.resolve(response);
        } else if (response.headers.get('Content-Type') === common.JSONTYPE) {
          return response.json().then(function (json) {
            // Only want to try refreshing token when there's an invalid session
            if ('errorCode' in json && json['errorCode'] === ErrInvalidSession) {
              if (!options.refreshOnFailure) {
                _this2.authManager.clear();
                var _error = new common.BaasError(json['error'], json['errorCode']);
                _error.response = response;
                throw _error;
              }

              return _this2._refreshToken().then(function () {
                options.refreshOnFailure = false;
                return _this2._do(resource, method, options);
              });
            }

            var error = new common.BaasError(json['error'], json['errorCode']);
            error.response = response;
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
        return response.json().then(function (json) {
          _this3.authManager.setAccessToken(json['accessToken']);
          return Promise.resolve();
        });
      });
    }
  }, {
    key: 'executePipeline',
    value: function executePipeline(stages, options) {
      var responseDecoder = function responseDecoder(d) {
        return new EJSON().parse(d, { strict: false });
      };
      var responseEncoder = function responseEncoder(d) {
        return new EJSON().stringify(d);
      };
      if (options) {
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
      }
      return this._do('/pipeline', 'POST', { body: responseEncoder(stages) }).then(function (response) {
        if (response.arrayBuffer) {
          return response.arrayBuffer();
        }
        return response.buffer();
      }).then(function (buf) {
        return new _textEncodingUtf.TextDecoder('utf-8').decode(new Uint8Array(buf));
      }).then(function (body) {
        return responseDecoder(body);
      });
    }
  }]);

  return BaasClient;
}();

var DB = function () {
  function DB(client, service, name) {
    _classCallCheck(this, DB);

    this.client = client;
    this.service = service;
    this.name = name;
  }

  _createClass(DB, [{
    key: 'getCollection',
    value: function getCollection(name) {
      return new Collection(this, name);
    }
  }]);

  return DB;
}();

var Collection = function () {
  function Collection(db, name) {
    _classCallCheck(this, Collection);

    this.db = db;
    this.name = name;
  }

  _createClass(Collection, [{
    key: 'getBaseArgs',
    value: function getBaseArgs() {
      return {
        'database': this.db.name,
        'collection': this.name
      };
    }
  }, {
    key: 'deleteOne',
    value: function deleteOne(query) {
      var args = this.getBaseArgs();
      args.query = query;
      args.singleDoc = true;
      return this.db.client.executePipeline([{
        'service': this.db.service,
        'action': 'delete',
        'args': args
      }]);
    }
  }, {
    key: 'deleteMany',
    value: function deleteMany(query) {
      var args = this.getBaseArgs();
      args.query = query;
      args.singleDoc = false;
      return this.db.client.executePipeline([{
        'service': this.db.service,
        'action': 'delete',
        'args': args
      }]);
    }
  }, {
    key: 'find',
    value: function find(query, project) {
      var args = this.getBaseArgs();
      args.query = query;
      args.project = project;
      return this.db.client.executePipeline([{
        'service': this.db.service,
        'action': 'find',
        'args': args
      }]);
    }
  }, {
    key: 'insert',
    value: function insert(docs) {
      var toInsert = void 0;
      if (docs instanceof Array) {
        toInsert = docs;
      } else {
        toInsert = Array.from(arguments);
      }

      return this.db.client.executePipeline([{ 'action': 'literal',
        'args': {
          'items': toInsert
        }
      }, {
        'service': this.db.service,
        'action': 'insert',
        'args': this.getBaseArgs()
      }]);
    }
  }, {
    key: 'makeUpdateStage',
    value: function makeUpdateStage(query, update, upsert, multi) {
      var args = this.getBaseArgs();
      args.query = query;
      args.update = update;
      if (upsert) {
        args.upsert = true;
      }
      if (multi) {
        args.multi = true;
      }

      return {
        'service': this.db.service,
        'action': 'update',
        'args': args
      };
    }
  }, {
    key: 'updateOne',
    value: function updateOne(query, update) {
      return this.db.client.executePipeline([this.makeUpdateStage(query, update, false, false)]);
    }
  }, {
    key: 'updateMany',
    value: function updateMany(query, update, upsert, multi) {
      return this.db.client.executePipeline([this.makeUpdateStage(query, update, false, true)]);
    }
  }, {
    key: 'upsert',
    value: function upsert(query, update) {
      return this.db.client.executePipeline([this.makeUpdateStage(query, update, true, false)]);
    }
  }]);

  return Collection;
}();

var MongoClient = exports.MongoClient = function () {
  function MongoClient(baasClient, serviceName) {
    _classCallCheck(this, MongoClient);

    this.baasClient = baasClient;
    this.service = serviceName;
  }

  _createClass(MongoClient, [{
    key: 'getDb',
    value: function getDb(name) {
      return new DB(this.baasClient, this.service, name);
    }
  }]);

  return MongoClient;
}();

var Admin = exports.Admin = function () {
  function Admin(baseUrl) {
    _classCallCheck(this, Admin);

    this.client = new BaasClient('', { baseUrl: baseUrl });
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
    value: function _put(url, queryParams) {
      return this._do(url, 'PUT', { queryParams: queryParams });
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
     *    a.apps().list()
     *
     * Fetch app under name 'planner'
     *    a.apps().app('planner').get()
     *
     * List services under the app 'planner'
     *    a.apps().app('planner').services().list()
     *
     * Delete a rule by ID
     *    a.apps().app('planner').services().service('mdb1').rules().rule('580e6d055b199c221fcb821d').remove()
     *
     */

  }, {
    key: 'apps',
    value: function apps() {
      var _this5 = this;

      var root = this;
      return {
        list: function list() {
          return root._get('/apps');
        },
        create: function create(data) {
          return root._post('/apps', data);
        },
        app: function app(appID) {
          return {
            get: function get() {
              return root._get('/apps/' + appID);
            },
            remove: function remove() {
              return root._delete('/apps/' + appID);
            },

            users: function users() {
              return {
                list: function list(filter) {
                  return _this5._get('/apps/' + appID + '/users', filter);
                },
                user: function user(uid) {
                  return {
                    get: function get() {
                      return _this5._get('/apps/' + appID + '/users/' + uid);
                    },
                    logout: function logout() {
                      return _this5._put('/apps/' + appID + '/users/' + uid + '/logout');
                    }
                  };
                }
              };
            },

            sandbox: function sandbox() {
              return {
                executePipeline: function executePipeline(data, userId) {
                  return _this5._do('/apps/' + appID + '/sandbox/pipeline', 'POST', { body: JSON.stringify(data), queryParams: { user_id: userId } });
                }
              };
            },

            authProviders: function authProviders() {
              return {
                create: function create(data) {
                  return _this5._post('/apps/' + appID + '/authProviders', data);
                },
                list: function list() {
                  return _this5._get('/apps/' + appID + '/authProviders');
                },
                provider: function provider(authType, authName) {
                  return {
                    get: function get() {
                      return _this5._get('/apps/' + appID + '/authProviders/' + authType + '/' + authName);
                    },
                    remove: function remove() {
                      return _this5._delete('/apps/' + appID + '/authProviders/' + authType + '/' + authName);
                    },
                    update: function update(data) {
                      return _this5._post('/apps/' + appID + '/authProviders/' + authType + '/' + authName, data);
                    }
                  };
                }
              };
            },
            values: function values() {
              return {
                list: function list() {
                  return _this5._get('/apps/' + appID + '/values');
                },
                value: function value(varName) {
                  return {
                    get: function get() {
                      return _this5._get('/apps/' + appID + '/values/' + varName);
                    },
                    remove: function remove() {
                      return _this5._delete('/apps/' + appID + '/values/' + varName);
                    },
                    create: function create(data) {
                      return _this5._post('/apps/' + appID + '/values/' + varName, data);
                    },
                    update: function update(data) {
                      return _this5._post('/apps/' + appID + '/values/' + varName, data);
                    }
                  };
                }
              };
            },
            pipelines: function pipelines() {
              return {
                list: function list() {
                  return _this5._get('/apps/' + appID + '/pipelines');
                },
                pipeline: function pipeline(varName) {
                  return {
                    get: function get() {
                      return _this5._get('/apps/' + appID + '/pipelines/' + varName);
                    },
                    remove: function remove() {
                      return _this5._delete('/apps/' + appID + '/pipelines/' + varName);
                    },
                    create: function create(data) {
                      return _this5._post('/apps/' + appID + '/pipelines/' + varName, data);
                    },
                    update: function update(data) {
                      return _this5._post('/apps/' + appID + '/pipelines/' + varName, data);
                    }
                  };
                }
              };
            },
            logs: function logs() {
              return {
                get: function get(filter) {
                  return _this5._get('/apps/' + appID + '/logs', filter);
                }
              };
            },
            apiKeys: function apiKeys() {
              return {
                list: function list() {
                  return _this5._get('/apps/' + appID + '/keys');
                },
                create: function create(data) {
                  return _this5._post('/apps/' + appID + '/keys', data);
                },
                apiKey: function apiKey(key) {
                  return {
                    get: function get() {
                      return _this5._get('/apps/' + appID + '/keys/' + key);
                    },
                    remove: function remove() {
                      return _this5._delete('/apps/' + appID + '/keys/' + key);
                    },
                    enable: function enable() {
                      return _this5._put('/apps/' + appID + '/keys/' + key + '/enable');
                    },
                    disable: function disable() {
                      return _this5._put('/apps/' + appID + '/keys/' + key + '/disable');
                    }
                  };
                }
              };
            },
            services: function services() {
              return {
                list: function list() {
                  return _this5._get('/apps/' + appID + '/services');
                },
                create: function create(data) {
                  return _this5._post('/apps/' + appID + '/services', data);
                },
                service: function service(svc) {
                  return {
                    get: function get() {
                      return _this5._get('/apps/' + appID + '/services/' + svc);
                    },
                    update: function update(data) {
                      return _this5._post('/apps/' + appID + '/services/' + svc, data);
                    },
                    remove: function remove() {
                      return _this5._delete('/apps/' + appID + '/services/' + svc);
                    },
                    setConfig: function setConfig(data) {
                      return _this5._post('/apps/' + appID + '/services/' + svc + '/config', data);
                    },

                    rules: function rules() {
                      return {
                        list: function list() {
                          return _this5._get('/apps/' + appID + '/services/' + svc + '/rules');
                        },
                        create: function create(data) {
                          return _this5._post('/apps/' + appID + '/services/' + svc + '/rules');
                        },
                        rule: function rule(ruleId) {
                          return {
                            get: function get() {
                              return _this5._get('/apps/' + appID + '/services/' + svc + '/rules/' + ruleId);
                            },
                            update: function update(data) {
                              return _this5._post('/apps/' + appID + '/services/' + svc + '/rules/' + ruleId, data);
                            },
                            remove: function remove() {
                              return _this5._delete('/apps/' + appID + '/services/' + svc + '/rules/' + ruleId);
                            }
                          };
                        }
                      };
                    },

                    incomingWebhooks: function incomingWebhooks() {
                      return {
                        list: function list() {
                          return _this5._get('/apps/' + appID + '/services/' + svc + '/incomingWebhooks');
                        },
                        create: function create(data) {
                          return _this5._post('/apps/' + appID + '/services/' + svc + '/incomingWebhooks');
                        },
                        incomingWebhook: function incomingWebhook(incomingWebhookId) {
                          return {
                            get: function get() {
                              return _this5._get('/apps/' + appID + '/services/' + svc + '/incomingWebhooks/' + incomingWebhookId);
                            },
                            update: function update(data) {
                              return _this5._post('/apps/' + appID + '/services/' + svc + '/incomingWebhooks/' + incomingWebhookId, data);
                            },
                            remove: function remove() {
                              return _this5._delete('/apps/' + appID + '/services/' + svc + '/incomingWebhooks/' + incomingWebhookId);
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