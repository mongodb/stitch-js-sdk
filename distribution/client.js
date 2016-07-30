"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cookie_js = require("cookie_js");

var _cookie_js2 = _interopRequireDefault(_cookie_js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MongoClient = function () {
  function MongoClient(db, appUrl) {
    _classCallCheck(this, MongoClient);

    this.db = db;
    this.appUrl = appUrl; // serverUrl 
    this.mongoSvcUrl = this.appUrl + "/svc/mdb1";
    this.authUrl = this.appUrl + "/auth";
    console.log("got", this.mongoSvcUrl, this.authUrl);
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
  }, {
    key: "authWithOAuth",
    value: function authWithOAuth(providerName) {
      window.location.replace(this.authUrl + "/oauth2/" + providerName + "?redirect=" + encodeURI(window.location));
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
        localStorage.removeItem("session");
        location.reload();
      }).fail(function (data) {
        // This is probably the wrong thing to do since it could have
        // failed for other reasons.
        localStorage.removeItem("session");
        location.reload();
      });
    }
  }, {
    key: "_session",
    value: function _session() {
      return localStorage.getItem("session");
    }
  }, {
    key: "recoverAuth",
    value: function recoverAuth() {

      if (this._session() !== null) {
        return this._session();
      }

      var query = window.location.search.substring(1);
      var vars = query.split('&');
      var session = null;
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == "session") {
          session = decodeURIComponent(pair[1]);
          window.history.replaceState(null, "", window.location.href.split('?')[0]);
        }
      }

      if (session !== null) {
        localStorage.setItem("session", session);
      }

      return this._session();
    }
  }]);

  return MongoClient;
}();

exports.default = MongoClient;