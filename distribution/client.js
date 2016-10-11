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

    this.appUrl = appUrl; // serverUrl 
    //this.mongoSvcUrl = `${this.appUrl}/svc/mdb1`
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
    key: "executeAction",
    value: function executeAction(service, action, args, callback) {
      if (this.auth() === null) {
        throw "Must auth before execute";
      }
      var payload = { action: action, arguments: args };
      console.log("payload is", payload);

      $.ajax({
        type: 'POST',
        contentType: "application/json",
        url: this.appUrl + "/svc/" + service,
        data: JSON.stringify(payload),
        dataType: 'json',
        headers: {
          'Authorization': "Bearer " + this.auth()['token']
        }
      }).done(function (data) {
        return callback(data);
      });
    }
  }]);

  return BaasClient;
}();

var MongoClient = function () {
  function MongoClient(baasClient, svcName) {
    _classCallCheck(this, MongoClient);

    this.baasClient = baasClient;
    this.svcName = svcName;
  }

  _createClass(MongoClient, [{
    key: "find",
    value: function find(db, collection, query, project, callback) {
      console.log("baas client is", this.baasClient);
      var args = {
        "database": db,
        "collection": collection,
        "query": query,
        "project": project
      };
      this.baasClient.executeAction(this.svcName, "find", args, callback);
    }

    // delete is a keyword in js, so this is called "remove" instead.

  }, {
    key: "remove",
    value: function remove(db, collection, query, singleDoc, callback) {
      var args = {
        "database": db,
        "collection": collection,
        "query": query
      };
      if (singleDoc) {
        args["singleDoc"] = true;
      }
      this.baasClient.executeAction(this.svcName, "delete", args, callback);
    }
  }, {
    key: "insert",
    value: function insert(db, collection, documents, callback) {
      var args = {
        "database": db,
        "collection": collection,
        "documents": documents
      };
      this.baasClient.executeAction(this.svcName, "insert", args, callback);
    }
  }, {
    key: "update",
    value: function update(db, collection, query, _update, upsert, multi, callback) {
      var args = {
        "database": db,
        "collection": collection,
        "query": query,
        "update": _update,
        "upsert": upsert,
        "multi": multi
      };
      this.baasClient.executeAction(this.svcName, "update", args, callback);
    }
  }]);

  return MongoClient;
}();

exports.MongoClient = MongoClient;