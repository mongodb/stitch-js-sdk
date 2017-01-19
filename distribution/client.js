'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Admin = exports.MongoClient = exports.BaasClient = exports.BaasError = exports.ErrInvalidSession = exports.ErrAuthProviderNotFound = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cookie_js = require('cookie_js');

var _cookie_js2 = _interopRequireDefault(_cookie_js);

require('whatwg-fetch');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// fetch polyfill

var USER_AUTH_KEY = "_baas_ua";
var REFRESH_TOKEN_KEY = "_baas_rt";
var STATE_KEY = "_baas_state";

var ErrAuthProviderNotFound = exports.ErrAuthProviderNotFound = "AuthProviderNotFound";
var ErrInvalidSession = exports.ErrInvalidSession = 'InvalidSession';
var stateLength = 64;

function toQueryString(obj) {
  var parts = [];
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
    }
  }
  return parts.join("&");
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

var BaasError = exports.BaasError = function (_Error) {
  _inherits(BaasError, _Error);

  function BaasError(message, code) {
    _classCallCheck(this, BaasError);

    var _this = _possibleConstructorReturn(this, (BaasError.__proto__ || Object.getPrototypeOf(BaasError)).call(this, message));

    _this.name = 'BaasError';
    _this.message = message;
    if (code !== undefined) {
      _this.code = code;
    }
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(_this, _this.constructor);
    } else {
      _this.stack = new Error(message).stack;
    }
    return _this;
  }

  return BaasError;
}(Error);

var BaasClient = exports.BaasClient = function () {
  function BaasClient(baseUrl, app) {
    _classCallCheck(this, BaasClient);

    this.appUrl = baseUrl;
    if (app) {
      this.appUrl = this.appUrl + '/v1/app/' + app;
    }
    this.authUrl = this.appUrl + '/auth';
    this.checkRedirectResponse();
  }

  _createClass(BaasClient, [{
    key: 'authWithLocal',
    value: function authWithLocal(username, password, cors) {
      var _this2 = this;

      var headers = new Headers();
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');

      var init = {
        method: "POST",
        body: JSON.stringify({ "username": username, "password": password }),
        headers: headers
      };

      if (cors) {
        init['cors'] = cors;
      }

      return fetch(this.authUrl + '/local/userpass', init).then(checkStatus).then(function (response) {
        return response.json().then(function (json) {
          _this2._setAuth(json);
          Promise.resolve();
        });
      });
    }

    // The state we generate is to be used for any kind of request where we will
    // complete an authentication flow via a redirect. We store the generate in 
    // a local storage bound to the app's origin. This ensures that any time we
    // receive a redirect, there must be a state parameter and it must match
    // what we ourselves have generated. This state MUST only be sent to
    // a trusted BaaS endpoint in order to preserve its integrity. BaaS will
    // store it in some way on its origin (currently a cookie stored on this client)
    // and use that state at the end of an auth flow as a parameter in the redirect URI.

  }, {
    key: 'generateState',
    value: function generateState() {
      var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var state = '';
      for (var i = 0; i < stateLength; i++) {
        var pos = Math.floor(Math.random() * alpha.length);
        state += alpha.substring(pos, pos + 1);
      }
      return state;
    }
  }, {
    key: 'prepareRedirect',
    value: function prepareRedirect() {
      var state = this.generateState();
      localStorage.setItem(STATE_KEY, state);
      return 'redirect=' + encodeURI(this.baseUrl()) + '&state=' + state;
    }
  }, {
    key: 'authWithOAuth',
    value: function authWithOAuth(providerName) {
      window.location.replace(this.authUrl + '/oauth2/' + providerName + '?' + this.prepareRedirect());
    }
  }, {
    key: 'linkWithOAuth',
    value: function linkWithOAuth(providerName) {
      if (this.auth() === null) {
        throw "Must auth before execute";
      }
      window.location.replace(this.authUrl + '/oauth2/' + providerName + '?' + this.prepareRedirect() + '&link=' + this.auth()['token']);
    }
  }, {
    key: 'logout',
    value: function logout() {
      var _this3 = this;

      return this._doAuthed("/auth", "DELETE", { refreshOnFailure: false, useRefreshToken: true }).then(function (data) {
        _this3._clearAuth();
      });
    }
  }, {
    key: '_clearAuth',
    value: function _clearAuth() {
      localStorage.removeItem(USER_AUTH_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }, {
    key: 'auth',
    value: function auth() {
      if (localStorage.getItem(USER_AUTH_KEY) === null) {
        return null;
      }
      return JSON.parse(atob(localStorage.getItem(USER_AUTH_KEY)));
    }
  }, {
    key: 'authedId',
    value: function authedId() {
      var a = this.auth();
      if (a == null) {
        return null;
      }
      return a['user']['_id'];
    }
  }, {
    key: 'baseUrl',
    value: function baseUrl() {
      return [location.protocol, '//', location.host, location.pathname].join('');
    }
  }, {
    key: '_setAuth',
    value: function _setAuth(json) {
      var rt = json['refreshToken'];
      delete json['refreshToken'];

      localStorage.setItem(USER_AUTH_KEY, btoa(JSON.stringify(json)));
      localStorage.setItem(REFRESH_TOKEN_KEY, rt);
    }
  }, {
    key: 'checkRedirectResponse',
    value: function checkRedirectResponse() {
      if (typeof window === 'undefined') {
        return;
      }

      var fragment = window.location.hash.substring(1);
      var vars = fragment.split('&');
      var found = false;
      var ua = null;
      var stateValidated = false;
      var stateFound = false;
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == "_baas_error") {
          this.lastError = decodeURIComponent(pair[1]);
          window.history.replaceState(null, "", this.baseUrl());
          console.log('BaasClient: error from \'' + this.appUrl + '\': ' + this.lastError);
          found = true;
          break;
        }
        if (decodeURIComponent(pair[0]) == "_baas_ua") {
          ua = JSON.parse(atob(decodeURIComponent(pair[1])));
          found = true;
        }
        if (decodeURIComponent(pair[0]) == "_baas_link") {
          found = true;
        }
        if (decodeURIComponent(pair[0]) == "_baas_state") {
          stateFound = true;
          var ourState = localStorage.getItem(STATE_KEY);
          var theirState = decodeURIComponent(pair[1]);
          if (ourState && ourState === theirState) {
            stateValidated = true;
          } else {
            console.log('BaasClient: our auth request state does not match what was provided!');
            window.history.replaceState(null, "", this.baseUrl());
          }
        }
      }
      if (found) {
        if (ua !== null) {
          if (stateValidated) {
            this._setAuth(ua);
          } else if (!stateFound) {
            console.log('BaasClient: our auth request state was never returned!');
          }
        }

        window.history.replaceState(null, "", this.baseUrl());
      }
      localStorage.removeItem(STATE_KEY);
    }
  }, {
    key: '_doAuthed',
    value: function _doAuthed(resource, method, options) {
      var _this4 = this;

      if (options === undefined) {
        options = { refreshOnFailure: true, useRefreshToken: false };
      } else {
        if (options.refreshOnFailure === undefined) {
          options.refreshOnFailure = true;
        }
        if (options.useRefreshToken === undefined) {
          options.useRefreshToken = false;
        }
      }

      if (this.auth() === null) {
        return Promise.reject(new BaasError("Must auth first"));
      }

      var url = '' + this.appUrl + resource;

      var headers = new Headers();
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');
      var init = {
        method: method,
        headers: headers
      };

      if (options.body) {
        init['body'] = options.body;
      }

      if (options.queryParams) {
        url = url + "?" + toQueryString(options.queryParams);
      }

      var token = options.useRefreshToken ? localStorage.getItem(REFRESH_TOKEN_KEY) : this.auth()['accessToken'];
      headers.append('Authorization', 'Bearer ' + token);

      return fetch(url, init).then(function (response) {
        // Okay: passthrough
        if (response.status >= 200 && response.status < 300) {
          return Promise.resolve(response);
        } else if (response.headers.get('Content-Type') === 'application/json') {
          return response.json().then(function (json) {
            // Only want to try refreshing token when there's an invalid session
            if ('errorCode' in json && json['errorCode'] == ErrInvalidSession) {
              if (!options.refreshOnFailure) {
                _this4._clearAuth();
                var _error = new BaasError(json['error'], json['errorCode']);
                _error.response = response;
                throw _error;
              }

              return _this4._refreshToken().then(function () {
                options.refreshOnFailure = false;
                return _this4._doAuthed(resource, method, options);
              });
            }

            var error = new BaasError(json['error'], json['errorCode']);
            error.response = response;
            throw error;
          });
        }

        var error = new Error(response.statusText);
        error.response = response;
        throw error;
      });
    }
  }, {
    key: '_refreshToken',
    value: function _refreshToken() {
      var _this5 = this;

      return this._doAuthed("/auth/newAccessToken", "POST", { refreshOnFailure: false, useRefreshToken: true }).then(function (response) {
        return response.json().then(function (json) {
          _this5._setAccessToken(json['accessToken']);
          return Promise.resolve();
        });
      });
    }
  }, {
    key: '_setAccessToken',
    value: function _setAccessToken(token) {
      var currAuth = JSON.parse(atob(localStorage.getItem(USER_AUTH_KEY)));
      currAuth['accessToken'] = token;
      localStorage.setItem(USER_AUTH_KEY, btoa(JSON.stringify(currAuth)));
    }
  }, {
    key: 'executePipeline',
    value: function executePipeline(stages) {
      return this._doAuthed('/pipeline', 'POST', { body: JSON.stringify(stages) }).then(function (response) {
        return response.json();
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
        "database": this.db.name,
        "collection": this.name
      };
    }
  }, {
    key: 'deleteOne',
    value: function deleteOne(query) {
      var args = this.getBaseArgs();
      args.query = query;
      args.singleDoc = true;
      return this.db.client.executePipeline([{
        "service": this.db.service,
        "action": "delete",
        "args": args
      }]);
    }
  }, {
    key: 'deleteMany',
    value: function deleteMany(query) {
      var args = this.getBaseArgs();
      args.query = query;
      args.singleDoc = false;
      return this.db.client.executePipeline([{
        "service": this.db.service,
        "action": "delete",
        "args": args
      }]);
    }
  }, {
    key: 'find',
    value: function find(query, project) {
      var args = this.getBaseArgs();
      args.query = query;
      args.project = project;
      return this.db.client.executePipeline([{
        "service": this.db.service,
        "action": "find",
        "args": args
      }]);
    }
  }, {
    key: 'insert',
    value: function insert(documents) {
      return this.db.client.executePipeline([{ "action": "literal",
        "args": {
          "items": documents
        }
      }, {
        "service": this.db.service,
        "action": "insert",
        "args": this.getBaseArgs()
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
        "service": this.db.service,
        "action": "update",
        "args": args
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

    this._baseUrl = baseUrl;
    this._client = new BaasClient(this._baseUrl + "/admin/v1");
  }

  _createClass(Admin, [{
    key: 'localAuth',
    value: function localAuth(username, password) {
      return this._client.authWithLocal(username, password, true);
    }
  }, {
    key: 'logout',
    value: function logout() {
      return this._client.logout();
    }

    // Authed methods

  }, {
    key: '_doAuthed',
    value: function _doAuthed(url, method, options) {
      return this._client._doAuthed(url, method, options).then(function (response) {
        return response.json();
      });
    }
  }, {
    key: '_get',
    value: function _get(url, queryParams) {
      return this._doAuthed(url, "GET", { queryParams: queryParams });
    }
  }, {
    key: '_put',
    value: function _put(url, queryParams) {
      return this._doAuthed(url, "PUT", { queryParams: queryParams });
    }
  }, {
    key: '_delete',
    value: function _delete(url) {
      return this._doAuthed(url, "DELETE");
    }
  }, {
    key: '_post',
    value: function _post(url, body) {
      return this._doAuthed(url, "POST", { body: JSON.stringify(body) });
    }
  }, {
    key: 'profile',
    value: function profile() {
      var root = this;
      return {
        keys: function keys() {
          return {
            list: function list() {
              return root._get("/profile/keys");
            },
            create: function create(key) {
              return root._post("/profile/keys");
            },
            key: function key(keyId) {
              return {
                get: function get() {
                  return root._get('/profile/keys/' + keyId);
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
     * Fetch app under name "planner"
     *    a.apps().app("planner").get()   
     *
     * List services under the app "planner"
     *    a.apps().app("planner").services().list()
     *
     * Delete a rule by ID
     *    a.apps().app("planner").services().service("mdb1").rules().rule("580e6d055b199c221fcb821d").remove()
     *
     */

  }, {
    key: 'apps',
    value: function apps() {
      var _this6 = this;

      var root = this;
      return {
        list: function list() {
          return root._get('/apps');
        },
        create: function create(data) {
          return root._post('/apps', data);
        },
        app: function app(_app) {
          return {
            get: function get() {
              return root._get('/apps/' + _app);
            },
            remove: function remove() {
              return root._delete('/apps/' + _app);
            },

            authProviders: function authProviders() {
              return {
                create: function create(data) {
                  return _this6._post('/apps/' + _app + '/authProviders', data);
                },
                list: function list() {
                  return _this6._get('/apps/' + _app + '/authProviders');
                },
                provider: function provider(authType, authName) {
                  return {
                    get: function get() {
                      return _this6._get('/apps/' + _app + '/authProviders/' + authType + '/' + authName);
                    },
                    remove: function remove() {
                      return _this6._delete('/apps/' + _app + '/authProviders/' + authType + '/' + authName);
                    },
                    update: function update(data) {
                      return _this6._post('/apps/' + _app + '/authProviders/' + authType + '/' + authName, data);
                    }
                  };
                }
              };
            },
            variables: function variables() {
              return {
                list: function list() {
                  return _this6._get('/apps/' + _app + '/vars');
                },
                create: function create(data) {
                  return _this6._post('/apps/' + _app + '/vars', data);
                },
                variable: function variable(varName) {
                  return {
                    get: function get() {
                      return _this6._get('/apps/' + _app + '/vars/' + varName);
                    },
                    remove: function remove() {
                      return _this6._delete('/apps/' + _app + '/vars/' + varName);
                    },
                    update: function update(data) {
                      return _this6._post('/apps/' + _app + '/vars/' + varName, data);
                    }
                  };
                }
              };
            },
            logs: function logs() {
              return {
                get: function get(filter) {
                  return _this6._get('/apps/' + _app + '/logs', filter);
                }
              };
            },

            services: function services() {
              return {
                list: function list() {
                  return _this6._get('/apps/' + _app + '/services');
                },
                create: function create(data) {
                  return _this6._post('/apps/' + _app + '/services', data);
                },
                service: function service(svc) {
                  return {
                    get: function get() {
                      return _this6._get('/apps/' + _app + '/services/' + svc);
                    },
                    update: function update(data) {
                      return _this6._post('/apps/' + _app + '/services/' + svc, data);
                    },
                    remove: function remove() {
                      return _this6._delete('/apps/' + _app + '/services/' + svc);
                    },
                    setConfig: function setConfig(data) {
                      return _this6._post('/apps/' + _app + '/services/' + svc + '/config', data);
                    },

                    rules: function rules() {
                      return {
                        list: function list() {
                          return _this6._get('/apps/' + _app + '/services/' + svc + '/rules');
                        },
                        create: function create(data) {
                          return _this6._post('/apps/' + _app + '/services/' + svc + '/rules');
                        },
                        rule: function rule(ruleId) {
                          return {
                            get: function get() {
                              return _this6._get('/apps/' + _app + '/services/' + svc + '/rules/' + ruleId);
                            },
                            update: function update(data) {
                              return _this6._post('/apps/' + _app + '/services/' + svc + '/rules/' + ruleId, data);
                            },
                            remove: function remove() {
                              return _this6._delete('/apps/' + _app + '/services/' + svc + '/rules/' + ruleId);
                            }
                          };
                        }
                      };
                    },

                    triggers: function triggers() {
                      return {
                        list: function list() {
                          return _this6._get('/apps/' + _app + '/services/' + svc + '/triggers');
                        },
                        create: function create(data) {
                          return _this6._post('/apps/' + _app + '/services/' + svc + '/triggers');
                        },
                        trigger: function trigger(triggerId) {
                          return {
                            get: function get() {
                              return _this6._get('/apps/' + _app + '/services/' + svc + '/triggers/' + triggerId);
                            },
                            update: function update(data) {
                              return _this6._post('/apps/' + _app + '/services/' + svc + '/triggers/' + triggerId, data);
                            },
                            remove: function remove() {
                              return _this6._delete('/apps/' + _app + '/services/' + svc + '/triggers/' + triggerId);
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
  }]);

  return Admin;
}();