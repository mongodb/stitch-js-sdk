import cookie from 'cookie_js'

const SESSION_KEY = "_baas_session";

export default class MongoClient {
  constructor(db, appUrl) {
    this.db = db;
    this.appUrl = appUrl; // serverUrl 
    this.mongoSvcUrl = `${this.appUrl}/svc/mdb1`
    this.authUrl = `${this.appUrl}/auth`

    this.checkRedirectResponse();
  }

  getBaseArgs(action, collection){
    return {
      action:action,
      arguments:{
        database:this.db,
        collection:collection
      }
    }
  }
  execute(body, callback){
    if (this._session() === null) {
      throw "Must auth before execute"
    }

    $.ajax({
      type: 'POST',
      contentType: "application/json",
      url: this.mongoSvcUrl,
      data: JSON.stringify(body),
      dataType: 'json',
      headers: {
        'Authorization': `Bearer ${this._session()}`
      }
    }).done((data) => callback(data))
  }

  //  TODO return promises from each of this.
  find(collection, query, project, callback){
    let body = this.getBaseArgs("find", collection)
    body.arguments["query"] = query
    body.arguments["project"] = project
    this.execute(body, callback)
  }

  // delete is a keyword in js, so this is called "remove" instead.
  remove(collection, query, singleDoc, callback){
    let body = this.getBaseArgs("delete", collection)
    body.arguments["query"] = query;
    if(singleDoc){
      body.arguments["singleDoc"] = true;
    }
    this.execute(body, callback)
  }

  insert(collection, documents, callback){
    let body = this.getBaseArgs("insert", collection);
    body.arguments["documents"] = documents;
    this.execute(body, callback)
  }
  update(collection, query, update, upsert, multi, callback){
    let body = this.getBaseArgs("update", collection);
    body.arguments["query"] = query;
    body.arguments["update"] = update;
    body.arguments["upsert"] = upsert;
    body.arguments["multi"] = multi;
    this.execute(body, callback)
  }

  /*
    Auth Methods
  */

  checkRedirectResponse(){
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    var found = false;
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == "_baas_error") {
          this.lastError = decodeURIComponent(pair[1])
          window.history.replaceState(null, "", this.baseUrl());
          console.log(`MongoClient: error from '${this.appUrl}': ${this.lastError}`);
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

  authWithOAuth(providerName){
    window.location.replace(`${this.authUrl}/oauth2/${providerName}?redirect=${encodeURI(this.baseUrl())}`);
  }

  logout() {
    $.ajax({
      type: 'DELETE',
      url: this.authUrl + "/logout",
      headers: {
        'Authorization': `Bearer ${this._session()}`
      }
    }).done((data) => {
      localStorage.removeItem(SESSION_KEY);
      location.reload();
    }).fail((data) => {
      // This is probably the wrong thing to do since it could have
      // failed for other reasons.
      localStorage.removeItem(SESSION_KEY);
      location.reload();
    });
  }

  _session(){
    return localStorage.getItem(SESSION_KEY);
  }

  auth(){
    return this._session();
  }

  baseUrl(){
    return [location.protocol, '//', location.host, location.pathname].join('');
  }

  linkWithOAuth(providerName){
    if (this._session() === null) {
      throw "Must auth before execute"
    }

    window.location.replace(`${this.authUrl}/oauth2/${providerName}?redirect=${encodeURI(this.baseUrl())}&link=${this._session()}`);
  }
}


