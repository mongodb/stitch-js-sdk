exports.MongoClient = function () {
  var $ = require("jquery");
  var USER_AUTH_KEY = "_baas_ua";

  return function MongoClient(db, appUrl) {
    this.getBaseArgs = function(action, collection){
      return {
        action: action,
        arguments: {
          database: this.db,
          collection: collection
        }
      };
    };
    this.execute = function(body, callback){
      if (this.auth() === null) {
        throw "Must auth before execute";
      }
      $.ajax({
        type: 'POST',
        contentType: "application/json",
        url: this.mongoSvcUrl,
        data: JSON.stringify(body),
        dataType: 'json',
        headers: {
          'Authorization': "Bearer " + this.auth()['token']
        }
      }).done(function (data) {
        return callback(data);
      });
    };

    this.find = function(collection, query, project, callback) {
      var body = this.getBaseArgs("find", collection);
      body.arguments["query"] = query;
      body.arguments["project"] = project;
      this.execute(body, callback);
    };
    
    // delete is a keyword in js, so this is called "remove" instead.
    this.remove = function( collection, query, singleDoc, callback) {
      var body = this.getBaseArgs("delete", collection);
      body.arguments["query"] = query;
      if (singleDoc) {
        body.arguments["singleDoc"] = true;
      }
      this.execute(body, callback);
    };

    this.insert = function(collection, documents, callback) {
      var body = this.getBaseArgs("insert", collection);
      body.arguments["documents"] = documents;
      this.execute(body, callback);
    };

    this.update = function(collection, query, _update, upsert, multi, callback) {
      var body = this.getBaseArgs("update", collection);
      body.arguments["query"] = query;
      body.arguments["update"] = _update;
      body.arguments["upsert"] = upsert;
      body.arguments["multi"] = multi;
      this.execute(body, callback);
    };

    this.checkRedirectResponse = function(){
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
    };

    this.authWithOAuth = function(providerName){
      window.location.replace(this.authUrl + "/oauth2/" + providerName + "?redirect=" + encodeURI(this.baseUrl()));
    };

    this.logout = function(){
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
    };

    this.auth = function(){
      if (localStorage.getItem(USER_AUTH_KEY) === null) {
        return null;
      }
      return JSON.parse(atob(localStorage.getItem(USER_AUTH_KEY)));
    };

    this.authedId = function(){
      var a = this.auth();
      if (a == null) {
        return null;
      }
      return a['user']['_id'];
    };

    this.baseUrl = function(){
      return [location.protocol, '//', location.host, location.pathname].join('');
    };

    this.linkWithOAuth = function(providerName){
      if (this.auth() === null) {
        throw "Must auth before execute";
      }
      window.location.replace(this.authUrl + "/oauth2/" + providerName + "?redirect=" + encodeURI(this.baseUrl()) + "&link=" + this.auth()['token']);
    };

    this.db = db;
    this.appUrl = appUrl; // serverUrl 
    this.mongoSvcUrl = this.appUrl + "/svc/mdb1";
    this.authUrl = this.appUrl + "/auth";

    this.checkRedirectResponse();
  };
}();

