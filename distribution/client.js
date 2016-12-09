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
        type: 'DELETE',
        headers: myHeaders
      }).done(function (data) {
        localStorage.removeItem(USER_AUTH_KEY);
        location.reload();
      }).fail(function (data) {
        // This is probably the wrong thing to do since it could have
        // failed for other reasons.
        localStorage.removeItem(USER_AUTH_KEY);
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
          localStorage.setItem(USER_AUTH_KEY, decodeURIComponent(pair[1]));
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
    key: 'executePipeline',
    value: function executePipeline(stages) {
      if (this.auth() === null) {
        throw "Must auth before execute";
      }

      return fetch(this.appUrl + '/pipeline', {
        type: 'POST',
        contentType: "application/json",
        data: JSON.stringify(stages),
        dataType: 'json',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + this.auth()['token']
        }
      }).then(checkStatus).then(function () {
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
  }

  _createClass(Admin, [{
    key: 'localAuth',
    value: function localAuth(username, password) {
      return this._post("/auth/local/userpass", { username: username, password: password });
    }
  }, {
    key: 'logout',
    value: function logout() {
      return this._get("/logout");
    }
  }, {
    key: '_ajaxArgs',
    value: function _ajaxArgs(method, data) {
      var myHeaders = new Headers();
      myHeaders.append('Accept', 'application/json');
      myHeaders.append('Content-Type', 'application/json');

      return {
        method: method,
        mode: 'cors',
        headers: myHeaders,
        credentials: 'include',
        body: JSON.stringify(data)
      };
    }
  }, {
    key: '_do',
    value: function _do(method, url, data) {
      return fetch('' + this._baseUrl + url, this._ajaxArgs(method, data)).then(checkStatus).then(function (response) {
        return response.json();
      });
    }
  }, {
    key: '_get',
    value: function _get(url) {
      return this._do("GET", url);
    }
  }, {
    key: '_delete',
    value: function _delete(url) {
      return this._do("DELETE", url);
    }
  }, {
    key: '_post',
    value: function _post(url, data) {
      return this._do("POST", url, data);
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
      var _this = this;

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
                  return _this._post('/apps/' + _app + '/authProviders', data);
                },
                list: function list() {
                  return _this._get('/apps/' + _app + '/authProviders');
                },
                provider: function provider(authType, authName) {
                  return {
                    get: function get() {
                      return _this._get('/apps/' + _app + '/authProviders/' + authType + '/' + authName);
                    },
                    remove: function remove() {
                      return _this._delete('/apps/' + _app + '/authProviders/' + authType + '/' + authName);
                    },
                    update: function update(data) {
                      return _this._post('/apps/' + _app + '/authProviders/' + authType + '/' + authName, data);
                    }
                  };
                }
              };
            },
            variables: function variables() {
              return {
                list: function list() {
                  return _this._get('/apps/' + _app + '/vars');
                },
                create: function create(data) {
                  return _this._post('/apps/' + _app + '/vars', data);
                },
                variable: function variable(varName) {
                  return {
                    get: function get() {
                      return _this._get('/apps/' + _app + '/vars/' + varName);
                    },
                    remove: function remove() {
                      return _this._delete('/apps/' + _app + '/vars/' + varName);
                    },
                    update: function update(data) {
                      return _this._post('/apps/' + _app + '/vars/' + varName, data);
                    }
                  };
                }
              };
            },

            services: function services() {
              return {
                list: function list() {
                  return _this._get('/apps/' + _app + '/services');
                },
                create: function create(data) {
                  return _this._post('/apps/' + _app + '/services', data);
                },
                service: function service(svc) {
                  return {
                    get: function get() {
                      return _this._get('/apps/' + _app + '/services/' + svc);
                    },
                    update: function update(data) {
                      return _this._post('/apps/' + _app + '/services/' + svc, data);
                    },
                    remove: function remove() {
                      return _this._delete('/apps/' + _app + '/services/' + svc);
                    },
                    setConfig: function setConfig(data) {
                      return _this._post('/apps/' + _app + '/services/' + svc + '/config', data);
                    },

                    rules: function rules() {
                      return {
                        list: function list() {
                          return _this._get('/apps/' + _app + '/services/' + svc + '/rules');
                        },
                        create: function create(data) {
                          return _this._post('/apps/' + _app + '/services/' + svc + '/rules');
                        },
                        rule: function rule(ruleId) {
                          return {
                            get: function get() {
                              return _this._get('/apps/' + _app + '/services/' + svc + '/rules/' + ruleId);
                            },
                            update: function update(data) {
                              return _this._post('/apps/' + _app + '/services/' + svc + '/rules/' + ruleId, data);
                            },
                            remove: function remove() {
                              return _this._delete('/apps/' + _app + '/services/' + svc + '/rules/' + ruleId);
                            }
                          };
                        }
                      };
                    },

                    triggers: function triggers() {
                      return {
                        list: function list() {
                          return _this._get('/apps/' + _app + '/services/' + svc + '/triggers');
                        },
                        create: function create(data) {
                          return _this._post('/apps/' + _app + '/services/' + svc + '/triggers');
                        },
                        trigger: function trigger(triggerId) {
                          return {
                            get: function get() {
                              return _this._get('/apps/' + _app + '/services/' + svc + '/triggers/' + triggerId);
                            },
                            update: function update(data) {
                              return _this._post('/apps/' + _app + '/services/' + svc + '/triggers/' + triggerId, data);
                            },
                            remove: function remove() {
                              return _this._delete('/apps/' + _app + '/services/' + svc + '/triggers/' + triggerId);
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