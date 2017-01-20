/* global it, describe, global, after, before, atob, btoa, require, Buffer */
const fetchMock = require('fetch-mock')
import {Auth, parseRedirectFragment} from '../source/client'
// import {BaasError, BaasClient} from '../source/client'
import {mocks} from 'mock-browser'
import {expect} from 'chai'

const MockBrowser = mocks.MockBrowser
global.Buffer = global.Buffer || require('buffer').Buffer

if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return new Buffer(str).toString('base64')
  }
}

if (typeof atob === 'undefined') {
  global.atob = function (b64Encoded) {
    return new Buffer(b64Encoded, 'base64').toString()
  }
}

describe('Redirect fragment parsing', () => {
  const makeFragment = (parts) => (
    Object.keys(parts).map(
      (key) => (encodeURIComponent(key) + '=' + parts[key])
    ).join('&')
  )

  it('should detect valid states', () => {
    let result = parseRedirectFragment(makeFragment({'_baas_state': atob('state_XYZ')}), atob('state_XYZ'))
    expect(result.stateValid).to.be.true
    expect(result.found).to.be.true
    expect(result.lastError).to.be.null
  })

  it('should detect invalid states', () => {
    let result = parseRedirectFragment(makeFragment({'_baas_state': atob('state_XYZ')}), atob('state_ABC'))
    expect(result.stateValid).to.be.false
    expect(result.lastError).to.be.null
  })

  it('should detect errors', () => {
    let result = parseRedirectFragment(makeFragment({'_baas_error': 'hello world'}), atob('state_ABC'))
    expect(result.lastError).to.equal('hello world')
    expect(result.stateValid).to.be.false
  })

  it('should detect if no items found', () => {
    let result = parseRedirectFragment(makeFragment({'foo': 'bar'}), atob('state_ABC'))
    expect(result.found).to.be.false
  })
})

describe('Auth', () => {
  before(() => {
    const mb = new MockBrowser()
    global.window = mb.getWindow()
    global.localStorage = mb.getLocalStorage()
    fetchMock.post('/auth/local/userpass', {user: {'_id': 'billybob'}})
  })

  after(() => {
    delete global.window
    delete global.localStorage
    fetchMock.restore()
  })

  it('get() set() clear() authedId() should work', () => {
    const a = new Auth('/auth')
    expect(a.get()).to.be.null

    const testUser = {'foo': 'bar', 'biz': 'baz', 'user': {'_id': 'gilfoyle'}}
    a.set(testUser)
    expect(a.get()).to.eql(testUser)
    expect(a.authedId()).to.equal('gilfoyle')

    a.clear()
    expect(a.get()).to.be.null
  })

  it('should local auth successfully', () => {
    const a = new Auth('/auth')
    a.localAuth('user', 'password', true).then(() => {
      expect(a.authedId()).to.eql('billybob')
    })
  })

  it('should allow setting access tokens', () => {
    const a = new Auth('/auth')
    a.localAuth('user', 'password', true).then(() => {
      expect(a.authedId()).to.eql('billybob')
      expect(a.get()['sessionToken']).to.be.undefined
      a.setSessionToken('foo')
      expect(a.get()['sessionToken']).to.equal('foo')
    })
  })
})

/*

describe('Client', ()=>{

  before(() => {
    const mb = new MockBrowser()
    global.window = mb.getWindow();
    global.localStorage = mb.getLocalStorage();
  });

  after(()=>{
    delete global.window;
    delete global.localStorage
  });

  describe('constructor', ()=>{
    it('should not throw an error', ()=>{
      const client = new BaasClient("/", "test")
      expect(client.auth()).to.be.null
    })
  })

  describe('auth()', ()=>{
    it('should get an OAuth URL', ()=>{
      const client = new BaasClient("/", "test")
      let loginUrl = client.getOAuthLoginURL("facebook")
      console.log("login url is", loginUrl)
      //client.authWithOAuth("facebook", "http://localhost:8080")
    })
  })
})
*/

