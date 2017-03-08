/* global window, fetch */

import * as common from './common'
import {Base64} from 'js-base64'

class AuthDataStorage {
  constructor () {
    this._data = {}
  }
  setItem (id, val) {
    this._data[id] = String(val)
  }
  getItem (id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined
  }
  removeItem (id) {
    return delete this._data[id]
  }
  clear () {
    this._data = {}
  }
}

export default class Auth {
  constructor (rootUrl) {
    this.rootUrl = rootUrl
    if (typeof (window) !== 'undefined' && window.localStorage !== undefined) {
      this.authDataStorage = window.localStorage
    } else {
      this.authDataStorage = new AuthDataStorage()
    }
  }

  pageRootUrl () {
    return [window.location.protocol, '//', window.location.host, window.location.pathname].join('')
  }

  // The state we generate is to be used for any kind of request where we will
  // complete an authentication flow via a redirect. We store the generate in
  // a local storage bound to the app's origin. This ensures that any time we
  // receive a redirect, there must be a state parameter and it must match
  // what we ourselves have generated. This state MUST only be sent to
  // a trusted BaaS endpoint in order to preserve its integrity. BaaS will
  // store it in some way on its origin (currently a cookie stored on this client)
  // and use that state at the end of an auth flow as a parameter in the redirect URI.
  static generateState () {
    let alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let state = ''
    const stateLength = 64
    for (var i = 0; i < stateLength; i++) {
      let pos = Math.floor(Math.random() * alpha.length)
      state += alpha.substring(pos, pos + 1)
    }
    return state
  }

  setAccessToken (token) {
    let currAuth = this.get()
    currAuth['accessToken'] = token
    currAuth['refreshToken'] = this.authDataStorage.getItem(common.REFRESH_TOKEN_KEY)
    this.set(currAuth)
  }

  error () {
    return this._error
  }

  handleRedirect () {
    if (typeof (window) === 'undefined') {
      // This means we're running in some environment other
      // than a browser - so handling a redirect makes no sense here.
      return
    }
    let ourState = this.authDataStorage.getItem(common.STATE_KEY)
    let redirectFragment = window.location.hash.substring(1)
    const redirectState = common.parseRedirectFragment(redirectFragment, ourState)
    if (redirectState.lastError) {
      console.error(`BaasClient: error from redirect: ${redirectState.lastError}`)
      this._error = redirectState.lastError
      window.history.replaceState(null, '', this.pageRootUrl())
      return
    }
    if (!redirectState.found) {
      return
    }
    this.authDataStorage.removeItem(common.STATE_KEY)
    if (!redirectState.stateValid) {
      console.error(`BaasClient: state values did not match!`)
      window.history.replaceState(null, '', this.pageRootUrl())
      return
    }
    if (!redirectState.ua) {
      console.error(`BaasClient: no UA value was returned from redirect!`)
      return
    }
    // If we get here, the state is valid - set auth appropriately.
    this.set(redirectState.ua)
    window.history.replaceState(null, '', this.pageRootUrl())
  }

  getOAuthLoginURL (providerName, redirectUrl) {
    if (redirectUrl === undefined) {
      redirectUrl = this.pageRootUrl()
    }
    let state = Auth.generateState()
    this.authDataStorage.setItem(common.STATE_KEY, state)
    let result = `${this.rootUrl}/oauth2/${providerName}?redirect=${encodeURI(redirectUrl)}&state=${state}`
    return result
  }

  anonymousAuth () {
    let fetchArgs = common.makeFetchArgs('GET')
    fetchArgs['cors'] = true

    return fetch(`${this.rootUrl}/anon/user`, fetchArgs)
      .then(common.checkStatus)
      .then(response => response.json())
      .then(json => {
        this.set(json)
      })
  }

  apiKeyAuth (key) {
    const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({'key': key}))
    fetchArgs['cors'] = true

    return fetch(`${this.rootUrl}/api/key`, fetchArgs)
      .then(common.checkStatus)
      .then(response => response.json())
      .then(json => {
        this.set(json)
      })
  }

  localAuth (username, password, options = {cors: true}) {
    const fetchArgs = common.makeFetchArgs('POST', JSON.stringify({username, password}))
    fetchArgs['cors'] = true

    return fetch(`${this.rootUrl}/local/userpass`, fetchArgs)
      .then(common.checkStatus)
      .then((response) => {
        return response.json().then((json) => {
          this.set(json)
          return Promise.resolve(json)
        })
      })
  }

  clear () {
    this.authDataStorage.removeItem(common.USER_AUTH_KEY)
    this.authDataStorage.removeItem(common.REFRESH_TOKEN_KEY)
    this.clearImpersonation()
  }

  getRefreshToken () {
    return this.authDataStorage.getItem(common.REFRESH_TOKEN_KEY)
  }

  set (json) {
    let rt = json['refreshToken']
    delete json['refreshToken']

    let c = Base64.encode
    this.authDataStorage.setItem(common.USER_AUTH_KEY, c(JSON.stringify(json)))
    this.authDataStorage.setItem(common.REFRESH_TOKEN_KEY, rt)
  }

  get () {
    if (!this.authDataStorage.getItem(common.USER_AUTH_KEY)) {
      return null
    }
    const item = this.authDataStorage.getItem(common.USER_AUTH_KEY)
    return JSON.parse(Base64.decode(item))
  }

  authedId () {
    let id = ((this.get() || {}).user || {})._id
    if (id) {
      return {'$oid': id}
    }
  }

  isImpersonatingUser () {
    return this.authDataStorage.getItem(common.IMPERSONATION_ACTIVE_KEY) === 'true'
  }

  refreshImpersonation (client) {
    let userId = this.authDataStorage.getItem(common.IMPERSONATION_USER_KEY)
    return client._doAuthed(`/admin/users/${userId}/impersonate`, 'POST', {refreshOnFailure: false, useRefreshToken: true}).then((response) => {
      return response.json().then((json) => {
        json['refreshToken'] = this.authDataStorage.getItem(common.REFRESH_TOKEN_KEY)
        this.set(json)
        return Promise.resolve()
      })
    }).catch((e) => {
      this.stopImpersonation()
      return Promise.reject(e)
    })
  }

  startImpersonation (client, userId) {
    if (this.get() === null) {
      return Promise.reject(new common.BaasError('Must auth first'))
    }
    if (this.isImpersonatingUser()) {
      return Promise.reject(new common.BaasError('Already impersonating a user'))
    }
    this.authDataStorage.setItem(common.IMPERSONATION_ACTIVE_KEY, 'true')
    this.authDataStorage.setItem(common.IMPERSONATION_USER_KEY, userId)

    let realUserAuth = JSON.parse(Base64.decode(this.authDataStorage.getItem(common.USER_AUTH_KEY)))
    realUserAuth['refreshToken'] = this.authDataStorage.getItem(common.REFRESH_TOKEN_KEY)
    this.authDataStorage.setItem(common.IMPERSONATION_REAL_USER_AUTH_KEY, Base64.encode(JSON.stringify(realUserAuth)))
    return this.refreshImpersonation(client)
  }

  stopImpersonation () {
    if (!this.isImpersonatingUser()) {
      throw new common.BaasError('Not impersonating a user')
    }
    return new Promise((resolve, reject) => {
      let realUserAuth = JSON.parse(Base64.decode(this.authDataStorage.getItem(common.IMPERSONATION_REAL_USER_AUTH_KEY)))
      this.set(realUserAuth)
      this.clearImpersonation()
      resolve()
    })
  }

  clearImpersonation () {
    this.authDataStorage.removeItem(common.IMPERSONATION_ACTIVE_KEY)
    this.authDataStorage.removeItem(common.IMPERSONATION_USER_KEY)
    this.authDataStorage.removeItem(common.IMPERSONATION_REAL_USER_AUTH_KEY)
  }
}

