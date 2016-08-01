"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cookie_js = require("cookie_js");

var _cookie_js2 = _interopRequireDefault(_cookie_js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SESSION_KEY = "_baas_session";

var MongoClient = function () {
  function MongoClient(db, appUrl) {
    _classCallCheck(this, MongoClient);

    this.db = db;
    this.appUrl = appUrl; // serverUrl 
    this.mongoSvcUrl = this.appUrl + "/svc/mdb1";
    this.authUrl = this.appUrl + "/auth";

    this.checkRedirectResponse();
  }

  _createClass(MongoClient, [{
    key: "getBaseArgs",
    value: function getBaseArgs(action, collection) {
      return {
        action: action,
        arguments: {
          database: this.db,
          collection: collection
        }
      };
    }
  }, {
    key: "execute",
    value: function execute(body, callback) {
      if (this._session() === null) {
        throw "Must auth before execute";
      }

      $.ajax({
        type: 'POST',
        contentType: "application/json",
        url: this.mongoSvcUrl,
        data: JSON.stringify(body),
        dataType: 'json',
        headers: {
          'Authorization': "Bearer " + this._session()
        }
      }).done(function (data) {
        return callback(data);
      });
    }

    //  TODO return promises from each of this.

  }, {
    key: "find",
    value: function find(collection, query, project, callback) {
      var body = this.getBaseArgs("find", collection);
      body.arguments["query"] = query;
      body.arguments["project"] = project;
      this.execute(body, callback);
    }

    // delete is a keyword in js, so this is called "remove" instead.

  }, {
    key: "remove",
    value: function remove(collection, query, singleDoc, callback) {
      var body = this.getBaseArgs("delete", collection);
      body.arguments["query"] = query;
      if (singleDoc) {
        body.arguments["singleDoc"] = true;
      }
      this.execute(body, callback);
    }
  }, {
    key: "insert",
    value: function insert(collection, documents, callback) {
      var body = this.getBaseArgs("insert", collection);
      body.arguments["documents"] = documents;
      this.execute(body, callback);
    }
  }, {
    key: "update",
    value: function update(collection, query, _update, upsert, multi, callback) {
      var body = this.getBaseArgs("update", collection);
      body.arguments["query"] = query;
      body.arguments["update"] = _update;
      body.arguments["upsert"] = upsert;
      body.arguments["multi"] = multi;
      this.execute(body, callback);
    }

    /*
      Auth Methods
    */

  }, {
    key: "checkRedirectResponse",
    value: function checkRedirectResponse() {
      var query = window.location.search.substring(1);
      var vars = query.split('&');
      var found = false;
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == "_baas_error") {
          this.lastError = decodeURIComponent(pair[1]);
          window.history.replaceState(null, "", this.baseUrl());
          console.log("MongoClient: error from '" + this.appUrl + "': " + this.lastError);
          found = true;
          break;
        }
        if (decodeURIComponent(pair[0]) == "_baas_session") {
          localStorage.setItem(SESSION_KEY, decodeURIComponent(pair[1]));
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
    key: "authWithOAuth",
    value: function authWithOAuth(providerName) {
      window.location.replace(this.authUrl + "/oauth2/" + providerName + "?redirect=" + encodeURI(this.baseUrl()));
    }
  }, {
    key: "logout",
    value: function logout() {
      $.ajax({
        type: 'DELETE',
        url: this.authUrl + "/logout",
        headers: {
          'Authorization': "Bearer " + this._session()
        }
      }).done(function (data) {
        localStorage.removeItem(SESSION_KEY);
        location.reload();
      }).fail(function (data) {
        // This is probably the wrong thing to do since it could have
        // failed for other reasons.
        localStorage.removeItem(SESSION_KEY);
        location.reload();
      });
    }
  }, {
    key: "_session",
    value: function _session() {
      return localStorage.getItem(SESSION_KEY);
    }
  }, {
    key: "auth",
    value: function auth() {
      return this._session();
    }
  }, {
    key: "baseUrl",
    value: function baseUrl() {
      return [location.protocol, '//', location.host, location.pathname].join('');
    }
  }, {
    key: "linkWithOAuth",
    value: function linkWithOAuth(providerName) {
      if (this._session() === null) {
        throw "Must auth before execute";
      }

      window.location.replace(this.authUrl + "/oauth2/" + providerName + "?redirect=" + encodeURI(this.baseUrl()) + "&link=" + this._session());
    }
  }]);

  return MongoClient;
}();

exports.default = MongoClient;