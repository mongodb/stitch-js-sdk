'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Admin = exports.MongoClient = exports.BaasClient = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cookie_js = require('cookie_js');

var _cookie_js2 = _interopRequireDefault(_cookie_js);

require('whatwg-fetch');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// fetch polyfill

var USER_AUTH_KEY = "_baas_ua";
var REFRESH_TOKEN_KEY = "_baas_rt";

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

var BaasClient = exports.BaasClient = function () {
  function BaasClient(appUrl) {
    _classCallCheck(this, BaasClient);

    this.appUrl = appUrl;
    this.authUrl = this.appUrl + '/auth';
    this.checkRedirectResponse();
  }

  _createClass(BaasClient, [{
    key: 'authWithLocal',
    value: function authWithLocal(username, password, cors) {
      var _this = this;

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
          _this._setAuth(json);
          Promise.resolve();
        });
      });
    }
  }, {
    key: 'authWithOAuth',
    value: function authWithOAuth(providerName) {
      window.location.replace(this.authUrl + '/oauth2/' + providerName + '?redirect=' + encodeURI(this.baseUrl()));
    }
  }, {
    key: 'linkWithOAuth',
    value: function linkWithOAuth(providerName) {
      if (this.auth() === null) {
        throw "Must auth before execute";
      }
      window.location.replace(this.authUrl + '/oauth2/' + providerName + '?redirect=' + encodeURI(this.baseUrl()) + '&link=' + this.auth()['token']);
    }
  }, {
    key: 'logout',
    value: function logout() {
      var myHeaders = new Headers();
      myHeaders.append('Accept', 'application/json');
      myHeaders.append('Content-Type', 'application/json');

      fetch(this.authUrl + "/logout", {
        method: 'DELETE',
        headers: myHeaders
      }).done(function (data) {
        localStorage.removeItem(USER_AUTH_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        location.reload();
      }).fail(function (data) {
        // This is probably the wrong thing to do since it could have
        // failed for other reasons.
        localStorage.removeItem(USER_AUTH_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        location.reload();
      });
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

      var query = window.location.search.substring(1);
      var vars = query.split('&');
      var found = false;
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
          var ua = JSON.parse(atob(decodeURIComponent(pair[1])));
          _setAuth(ua);
          found = true;
          break;
        }
        if (decodeURIComponent(pair[0]) == "_baas_link") {
          found = true;
          break;
        }
      }
      if (found) {
        window.history.replaceState(null, "", this.baseUrl());
      }
    }
  }, {
    key: '_doAuthed',
    value: function _doAuthed(resource, method, body) {
      var _this2 = this;

      if (this.auth() === null) {
        return Promise.reject(new Error("Must auth first"));
      }

      var url = '' + this.appUrl + resource;
      var headers = new Headers();
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');
      var init = {
        method: method,
        headers: headers
      };

      if (body) {
        init['body'] = body;
      }

      headers.append('Authorization', 'Bearer ' + this.auth()['accessToken']);

      return fetch(url, init).then(function (response) {

        // Okay: passthrough
        if (response.status >= 200 && response.status < 300) {
          return Promise.resolve(response);

          // Unauthorized: parse and try to reauth
        } else if (response.status == 401) {
          return _this2._handleUnauthorized(response).then(function () {
            // Run the request again
            headers.set('Authorization', 'Bearer ' + _this2.auth()['accessToken']);
            return fetch(url, init);
          });
        }

        var error = new Error(response.statusText);
        error.response = response;
        throw error;
      });
    }
  }, {
    key: '_handleUnauthorized',
    value: function _handleUnauthorized(response) {
      var _this3 = this;

      if (response.headers.get('Content-Type') === 'application/json') {
        return response.json().then(function (json) {
          // Only want to try refreshing token when there's an invalid session
          if ('errorCode' in json && json['errorCode'] == 'InvalidSession') {
            return _this3._refreshToken();
          }
        });
      }

      // Can't handle this response
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }, {
    key: '_refreshToken',
    value: function _refreshToken() {
      var _this4 = this;

      var rt = localStorage.getItem(REFRESH_TOKEN_KEY);

      var headers = new Headers();
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'Bearer ' + rt);
      return fetch(this.appUrl + '/auth/newAccessToken', {
        method: 'POST',
        headers: headers
      }).then(function (response) {
        if (response.status != 200) {
          var error = new Error(response.statusText);
          error.response = response;
          throw error;

          // Something is wrong with our refresh token
        } else if (response.status == 401) {
          if (response.headers.get('Content-Type') === 'application/json') {
            return response.json().then(function (json) {
              throw json;
            });
          }
          var error = new Error(response.statusText);
          error.response = response;
          throw error;
        }

        return response.json().then(function (json) {
          _this4._setAccessToken(json['accessToken']);
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
      return this._doAuthed('/pipeline', 'POST', JSON.stringify(stages)).then(checkStatus).then(function (response) {
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
    this._client = new BaasClient(this._baseUrl);
  }

  _createClass(Admin, [{
    key: 'localAuth',
    value: function localAuth(username, password) {
      return this._client.authWithLocal(username, password, true);
    }
  }, {
    key: 'logout',
    value: function logout() {
      return this._delete("/auth");
    }

    // Authed methods

  }, {
    key: '_doAuthed',
    value: function _doAuthed(url, method, data) {
      return this._client._doAuthed(url, method, JSON.stringify(data)).then(checkStatus).then(function (response) {
        return response.json();
      });
    }
  }, {
    key: '_get',
    value: function _get(url) {
      return this._doAuthed(url, "GET");
    }
  }, {
    key: '_delete',
    value: function _delete(url) {
      return this._doAuthed(url, "DELETE");
    }
  }, {
    key: '_post',
    value: function _post(url, data) {
      return this._doAuthed(url, "POST", data);
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
      var _this5 = this;

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
                  return _this5._post('/apps/' + _app + '/authProviders', data);
                },
                list: function list() {
                  return _this5._get('/apps/' + _app + '/authProviders');
                },
                provider: function provider(authType, authName) {
                  return {
                    get: function get() {
                      return _this5._get('/apps/' + _app + '/authProviders/' + authType + '/' + authName);
                    },
                    remove: function remove() {
                      return _this5._delete('/apps/' + _app + '/authProviders/' + authType + '/' + authName);
                    },
                    update: function update(data) {
                      return _this5._post('/apps/' + _app + '/authProviders/' + authType + '/' + authName, data);
                    }
                  };
                }
              };
            },
            variables: function variables() {
              return {
                list: function list() {
                  return _this5._get('/apps/' + _app + '/vars');
                },
                create: function create(data) {
                  return _this5._post('/apps/' + _app + '/vars', data);
                },
                variable: function variable(varName) {
                  return {
                    get: function get() {
                      return _this5._get('/apps/' + _app + '/vars/' + varName);
                    },
                    remove: function remove() {
                      return _this5._delete('/apps/' + _app + '/vars/' + varName);
                    },
                    update: function update(data) {
                      return _this5._post('/apps/' + _app + '/vars/' + varName, data);
                    }
                  };
                }
              };
            },

            services: function services() {
              return {
                list: function list() {
                  return _this5._get('/apps/' + _app + '/services');
                },
                create: function create(data) {
                  return _this5._post('/apps/' + _app + '/services', data);
                },
                service: function service(svc) {
                  return {
                    get: function get() {
                      return _this5._get('/apps/' + _app + '/services/' + svc);
                    },
                    update: function update(data) {
                      return _this5._post('/apps/' + _app + '/services/' + svc, data);
                    },
                    remove: function remove() {
                      return _this5._delete('/apps/' + _app + '/services/' + svc);
                    },
                    setConfig: function setConfig(data) {
                      return _this5._post('/apps/' + _app + '/services/' + svc + '/config', data);
                    },

                    rules: function rules() {
                      return {
                        list: function list() {
                          return _this5._get('/apps/' + _app + '/services/' + svc + '/rules');
                        },
                        create: function create(data) {
                          return _this5._post('/apps/' + _app + '/services/' + svc + '/rules');
                        },
                        rule: function rule(ruleId) {
                          return {
                            get: function get() {
                              return _this5._get('/apps/' + _app + '/services/' + svc + '/rules/' + ruleId);
                            },
                            update: function update(data) {
                              return _this5._post('/apps/' + _app + '/services/' + svc + '/rules/' + ruleId, data);
                            },
                            remove: function remove() {
                              return _this5._delete('/apps/' + _app + '/services/' + svc + '/rules/' + ruleId);
                            }
                          };
                        }
                      };
                    },

                    triggers: function triggers() {
                      return {
                        list: function list() {
                          return _this5._get('/apps/' + _app + '/services/' + svc + '/triggers');
                        },
                        create: function create(data) {
                          return _this5._post('/apps/' + _app + '/services/' + svc + '/triggers');
                        },
                        trigger: function trigger(triggerId) {
                          return {
                            get: function get() {
                              return _this5._get('/apps/' + _app + '/services/' + svc + '/triggers/' + triggerId);
                            },
                            update: function update(data) {
                              return _this5._post('/apps/' + _app + '/services/' + svc + '/triggers/' + triggerId, data);
                            },
                            remove: function remove() {
                              return _this5._delete('/apps/' + _app + '/services/' + svc + '/triggers/' + triggerId);
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