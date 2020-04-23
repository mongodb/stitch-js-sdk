import { AuthProviderConfig, AuthProviderType } from '../src/api/v3/AuthProviders';

import RealmMongoFixture from './fixtures/realm_mongo_fixture';
import { buildAdminTestHarness, extractTestFixtureDataPoints } from './testutil';

const validConfig = {
  emailConfirmationUrl: 'http://emailConfirmURL.com',
  resetPasswordUrl: 'http://resetPasswordURL.com',
  confirmEmailSubject: 'email subject',
  resetPasswordSubject: 'password subject',
};

describe('Auth Providers', () => {
  const test = new RealmMongoFixture();
  let th;
  let authProviders;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    authProviders = th.app().authProviders();
  });

  afterEach(async () => th.cleanup());

  it('listing auth providers should return list', async () => {
    const providers = await authProviders.list();
    expect(providers.length).toEqual(1);
    expect(providers[0].name).toEqual('api-key');
    expect(providers[0].type).toEqual('api-key');
  });
  it('creating auth provider should work', async () => {
    const newProvider = await authProviders.create(
      new AuthProviderConfig({
        type: AuthProviderType.Userpass,
        config: validConfig,
      })
    );
    expect(newProvider.type).toEqual('local-userpass');
    expect(newProvider.name).toEqual('local-userpass');
    expect(newProvider.config).toBeUndefined();
    const providers = await authProviders.list();
    expect(providers).toHaveLength(2);
    expect(providers[0].type).toEqual('api-key');
    expect(providers[1].type).toEqual(newProvider.type);
  });
  it('invalid create requests should fail', async () => {
    await expect(
      authProviders.create(new AuthProviderConfig({ type: AuthProviderType.Userpass }))
    ).rejects.toBeDefined();
  });
  it('fetching auth provider should work', async () => {
    const newAuthProvider = await authProviders.create(
      new AuthProviderConfig({
        type: AuthProviderType.Userpass,
        config: validConfig,
      })
    );
    expect(newAuthProvider.type).toEqual('local-userpass');
    const provider = await authProviders.authProvider(newAuthProvider.id).get();
    expect(provider.type).toEqual(provider.type);
  });
  it('enabling auth provider should work', async () => {
    const newAuthProvider = await authProviders.create(
      new AuthProviderConfig({
        type: AuthProviderType.Userpass,
        config: validConfig,
        disabled: true,
      })
    );
    expect(newAuthProvider.type).toEqual('local-userpass');
    const fetchedProvider = await authProviders.authProvider(newAuthProvider.id).get();
    expect(newAuthProvider.id).toEqual(fetchedProvider.id);
    await authProviders.authProvider(newAuthProvider.id).enable();
    const provider = await authProviders.authProvider(newAuthProvider.id).get();
    expect(provider.type).toEqual(provider.type);
    expect(provider.disabled).toEqual(false);
  });
  it('disabling auth provider should work', async () => {
    const newAuthProvider = await authProviders.create(
      new AuthProviderConfig({
        type: AuthProviderType.Userpass,
        config: validConfig,
        disabled: false,
      })
    );
    expect(newAuthProvider.type).toEqual('local-userpass');
    let provider = await authProviders.authProvider(newAuthProvider.id).get();
    expect(provider.disabled).toEqual(false);
    await authProviders.authProvider(newAuthProvider.id).disable();
    provider = await authProviders.authProvider(newAuthProvider.id).get();
    expect(provider.disabled).toEqual(true);
  });
  it('deleting an auth provider should work', async () => {
    const newAuthProvider = await authProviders.create(
      new AuthProviderConfig({
        type: AuthProviderType.Userpass,
        config: validConfig,
      })
    );
    let providers = await authProviders.list();
    expect(providers).toHaveLength(2);
    await authProviders.authProvider(newAuthProvider.id).disable();
    await authProviders.authProvider(newAuthProvider.id).remove();
    providers = await authProviders.list();
    expect(providers).toHaveLength(1);
  });
  it('deleting an auth provider should fail if the auth provider is still enabled', async () => {
    const newAuthProvider = await authProviders.create(
      new AuthProviderConfig({
        type: AuthProviderType.Userpass,
        config: validConfig,
      })
    );
    const providers = await authProviders.list();
    expect(providers).toHaveLength(2);
    await expect(authProviders.authProvider(newAuthProvider.id).remove()).rejects.toBeDefined();
  });
  it('updating auth provider should work', async () => {
    const newAuthProvider = await authProviders.create(
      new AuthProviderConfig({
        type: AuthProviderType.Userpass,
        config: validConfig,
      })
    );
    await authProviders.authProvider(newAuthProvider.id).update(
      new AuthProviderConfig({
        config: {
          confirmEmailSubject: 'updated email subject',
          resetPasswordSubject: 'updated password subject',
        },
      })
    );
    const authProvider = await authProviders.authProvider(newAuthProvider.id).get();
    expect(authProvider.config).toEqual({
      emailConfirmationUrl: 'http://emailConfirmURL.com',
      resetPasswordUrl: 'http://resetPasswordURL.com',
      confirmEmailSubject: 'updated email subject',
      resetPasswordSubject: 'updated password subject',
    });
  });
});
