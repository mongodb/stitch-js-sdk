const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

const validConfig = {
  emailConfirmationUrl: 'http://emailConfirmURL.com',
  resetPasswordUrl: 'http://resetPasswordURL.com',
  confirmEmailSubject: 'email subject',
  resetPasswordSubject: 'password subject'
};

describe('Auth Providers', ()=>{
  let test = new StitchMongoFixture();
  let th;
  let authProviders;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    authProviders = th.app().authProviders();
  });

  afterEach(async() => th.cleanup());

  it('listing auth providers should return list', async() => {
    let providers = await authProviders.list();
    expect(providers.length).toEqual(1);
    expect(providers[0].name).toEqual('api-key');
    expect(providers[0].type).toEqual('api-key');
  });
  it('creating auth provider should work', async() => {
    let newProvider = await authProviders.create({type: 'local-userpass', config: validConfig});
    expect(newProvider.type).toEqual('local-userpass');
    expect(newProvider.name).toEqual('local-userpass');
    expect(newProvider.config).toBeUndefined();
    let providers = await authProviders.list();
    expect(providers).toHaveLength(2);
    expect(providers[0].type).toEqual('api-key');
    expect(providers[1].type).toEqual(newProvider.type);
  });
  it('invalid create requests should fail', async() => {
    await expect(authProviders.create({type: 'local-userpass'})).rejects.toBeDefined();
    await expect(authProviders.create({type: 'bad#type'})).rejects.toBeDefined();
  });
  it('fetching auth provider should work', async() => {
    let newAuthProvider = await authProviders.create({type: 'local-userpass', config: validConfig});
    expect(newAuthProvider.type).toEqual('local-userpass');
    let provider = await authProviders.authProvider(newAuthProvider._id).get();
    expect(provider.type).toEqual(provider.type);
  });
  it('enabling auth provider should work', async() => {
    let newAuthProvider = await authProviders.create({type: 'local-userpass', config: validConfig, disabled: true});
    expect(newAuthProvider.type).toEqual('local-userpass');
    let fetchedProvider = await authProviders.authProvider(newAuthProvider._id).get();
    expect(newAuthProvider._id).toEqual(fetchedProvider._id);
    await authProviders.authProvider(newAuthProvider._id).enable();
    let provider = await authProviders.authProvider(newAuthProvider._id).get();
    expect(provider.type).toEqual(provider.type);
    expect(provider.disabled).toEqual(false);
  });
  it('disabling auth provider should work', async() => {
    let newAuthProvider = await authProviders.create({type: 'local-userpass', config: validConfig, disabled: false});
    expect(newAuthProvider.type).toEqual('local-userpass');
    let provider = await authProviders.authProvider(newAuthProvider._id).get();
    expect(provider.disabled).toEqual(false);
    await authProviders.authProvider(newAuthProvider._id).disable();
    provider = await authProviders.authProvider(newAuthProvider._id).get();
    expect(provider.disabled).toEqual(true);
  });
  it('deleting an auth provider should work', async() => {
    let newAuthProvider = await authProviders.create({type: 'local-userpass', config: validConfig});
    let providers = await authProviders.list();
    expect(providers).toHaveLength(2);
    await authProviders.authProvider(newAuthProvider._id).disable();
    await authProviders.authProvider(newAuthProvider._id).remove();
    providers = await authProviders.list();
    expect(providers).toHaveLength(1);
  });
  it('deleting an auth provider should fail if the auth provider is still enabled', async() => {
    let newAuthProvider = await authProviders.create({type: 'local-userpass', config: validConfig});
    let providers = await authProviders.list();
    expect(providers).toHaveLength(2);
    await expect(authProviders.authProvider(newAuthProvider._id).remove()).rejects.toBeDefined();
  });
  it('updating auth provider should work', async() => {
    let newAuthProvider = await authProviders.create({type: 'local-userpass', config: validConfig});
    await authProviders.authProvider(newAuthProvider._id).update({
      config: {
        confirmEmailSubject: 'updated email subject',
        resetPasswordSubject: 'updated password subject'
      }
    });
    let authProvider = await authProviders.authProvider(newAuthProvider._id).get();
    expect(authProvider.config).toEqual({
      emailConfirmationUrl: 'http://emailConfirmURL.com',
      resetPasswordUrl: 'http://resetPasswordURL.com',
      confirmEmailSubject: 'updated email subject',
      resetPasswordSubject: 'updated password subject'
    });
  });
});
