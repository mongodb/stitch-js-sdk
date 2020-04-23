import { Secret } from '../src/api/v3/Secrets';

import RealmMongoFixture from './fixtures/realm_mongo_fixture';
import { buildAdminTestHarness, extractTestFixtureDataPoints } from './testutil';

describe('Secrets', () => {
  const test = new RealmMongoFixture();
  let th;
  let appSecrets;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    appSecrets = th.app().secrets();
  });

  afterEach(async () => th.cleanup());

  const testSecretName = 'testvaluename';
  it('returns an empty list when no secrets exist for the app', async () => {
    const secrets = await appSecrets.list();
    expect(secrets).toEqual([]);
  });
  it('returns a list containing the new secret after one has been created', async () => {
    const secret = await appSecrets.create(new Secret({ name: testSecretName }));
    expect(secret.name).toEqual(testSecretName);
    const secrets = await appSecrets.list();
    expect(secrets).toHaveLength(1);
    expect(secrets[0]).toEqual(secret);
  });
  it('can update a secret name', async () => {
    const secret = await appSecrets.create(new Secret({ name: testSecretName }));
    secret.name = 'anotherName';
    await appSecrets.secret(secret.id).update(secret);
    const secrets = await appSecrets.list();
    expect(secrets[0].name).toEqual('anotherName');
  });
  it('can delete a secret', async () => {
    const secret = await appSecrets.create(new Secret({ name: testSecretName }));
    expect(secret.name).toEqual(testSecretName);
    let secrets = await appSecrets.list();
    expect(secrets).toHaveLength(1);
    await appSecrets.secret(secret.id).remove();

    secrets = await appSecrets.list();
    expect(secrets).toHaveLength(0);
  });
});
