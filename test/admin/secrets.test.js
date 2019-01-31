const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

describe('Secrets', () => {
  let test = new StitchMongoFixture();
  let th;
  let appSecrets;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    appSecrets = th.app().secrets();
  });

  afterEach(async() => th.cleanup());

  const testSecretName = 'testvaluename';
  it('listing secrets should return empty list', async() => {
    let secrets = await appSecrets.list();
    expect(secrets).toEqual([]);
  });
  it('creating secret should make it appear in list', async() => {
    let secret = await appSecrets.create({name: testSecretName});
    expect(secret.name).toEqual(testSecretName);
    let secrets = await appSecrets.list();
    expect(secrets).toHaveLength(1);
    expect(secrets[0]).toEqual(secret);
  });
  it('can update a secret name', async() => {
    let secret = await appSecrets.create({name: testSecretName});
    secret.name = 'anotherName';
    await appSecrets.secret(secret._id).update(secret);
    let secrets = await appSecrets.list();
    expect(secrets[0].name).toEqual('anotherName');
  });
  it('can delete a secret', async() => {
    let secret = await appSecrets.create({name: testSecretName});
    expect(secret.name).toEqual(testSecretName);
    let secrets = await appSecrets.list();
    expect(secrets).toHaveLength(1);
    await appSecrets.secret(secret._id).remove();

    secrets = await appSecrets.list();
    expect(secrets).toHaveLength(0);
  });
});
