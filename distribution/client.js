"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MongoClient = exports.BaasClient = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cookie_js = require("cookie_js");

var _cookie_js2 = _interopRequireDefault(_cookie_js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var USER_AUTH_KEY = "_baas_ua";

var BaasClient = exports.BaasClient = function () {
  function BaasClient(appUrl) {
    _classCallCheck(this, BaasClient);

    this.appUrl = appUrl;
    this.authUrl = this.appUrl + "/auth";
    this.checkRedirectResponse();
  }

  _createClass(BaasClient, [{
    key: "authWithOAuth",
    value: function authWithOAuth(providerName) {
      window.location.replace(this.authUrl + "/oauth2/" + providerName + "?redirect=" + encodeURI(this.baseUrl()));
    }
  }, {
    key: "linkWithOAuth",
    value: function linkWithOAuth(providerName) {
      if (this.auth() === null) {
        throw "Must auth before execute";
      }
      window.location.replace(this.authUrl + "/oauth2/" + providerName + "?redirect=" + encodeURI(this.baseUrl()) + "&link=" + this.auth()['token']);
    }
  }, {
    key: "logout",
    value: function logout() {
      $.ajax({
        type: 'DELETE',
        url: this.authUrl + "/logout",
        headers: {
          'Authorization': "Bearer " + this.auth()['token']
        }
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
    key: "auth",
    value: function auth() {
      if (localStorage.getItem(USER_AUTH_KEY) === null) {
        return null;
      }
      return JSON.parse(atob(localStorage.getItem(USER_AUTH_KEY)));
    }
  }, {
    key: "authedId",
    value: function authedId() {
      var a = this.auth();
      if (a == null) {
        return null;
      }
      return a['user']['_id'];
    }
  }, {
    key: "baseUrl",
    value: function baseUrl() {
      return [location.protocol, '//', location.host, location.pathname].join('');
    }
  }, {
    key: "checkRedirectResponse",
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
          console.log("BaasClient: error from '" + this.appUrl + "': " + this.lastError);
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
    key: "executePipeline",
    value: function executePipeline(stages) {
      if (this.auth() === null) {
        throw "Must auth before execute";
      }

      return $.ajax({
        type: 'POST',
        contentType: "application/json",
        url: this.appUrl + "/pipeline",
        data: JSON.stringify(stages),
        dataType: 'json',
        headers: {
          'Authorization': "Bearer " + this.auth()['token']
        }
      });
    }
  }, {
    key: "executeAction",
    value: function executeAction(service, action, args) {
      if (this.auth() === null) {
        throw "Must auth before execute";
      }
      var payload = { action: action, arguments: args };

      return $.ajax({
        type: 'POST',
        contentType: "application/json",
        url: this.appUrl + "/svc/" + service,
        data: JSON.stringify(payload),
        dataType: 'json',
        headers: {
          'Authorization': "Bearer " + this.auth()['token']
        }
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
    key: "getCollection",
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
    key: "getBaseArgs",
    value: function getBaseArgs() {
      return {
        "database": this.db.name,
        "collection": this.name
      };
    }

    // delete is a keyword in js, so this is called "remove" instead.

  }, {
    key: "remove",
    value: function remove(query, singleDoc) {
      var args = this.getBaseArgs();
      args.query = query;
      if (singleDoc) {
        args["singleDoc"] = true;
      }
      return this.db.client.executeAction(this.db.service, "delete", args);
    }
  }, {
    key: "find",
    value: function find(query, project) {
      var args = this.getBaseArgs();
      args.query = query;
      args.project = project;
      return this.db.client.executeAction(this.db.service, "find", args);
    }
  }, {
    key: "insert",
    value: function insert(documents) {
      var args = this.getBaseArgs();
      args.documents = documents;
      return this.db.client.executeAction(this.db.service, "insert", args);
    }
  }, {
    key: "update",
    value: function update(query, _update, upsert, multi) {
      var args = this.getBaseArgs();
      args.query = query;
      args.update = _update;
      args.upsert = upsert;
      args.multi = multi;
      return this.db.client.executeAction(this.db.service, "update", args);
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
    key: "getDb",
    value: function getDb(name) {
      return new DB(this.baasClient, this.service, name);
    }
  }]);

  return MongoClient;
}();