import { StitchClient, StitchClientFactory } from '../src/client';
import { buildAdminTestHarness, extractTestFixtureDataPoints } from './testutil';
import StitchMongoFixture from './fixtures/stitch_mongo_fixture';

describe('StitchClient', () => {
  const test = new StitchMongoFixture();

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  let th;

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    await th.configureUserpass();
    await th.createUser();
  });

  afterEach(async() => await th.cleanup());

  it('should not allow instantiation of StitchClient', async() => {
    expect(() => new StitchClient()).toThrowError(
      /StitchClient can only be made from the StitchClientFactory\.create function/
    );
  });

  it('should not allow instantiation of StitchClientFactory', async() => {
    expect(() => new StitchClientFactory()).toThrowError(
      /StitchClient can only be made from the StitchClientFactory\.create function/
    );
  });

  it('should not allow calls to `service` as a constructor', async() => {
    const client = await StitchClientFactory.create();
    try {
    	expect(new client.service('mongodb', 'mdb1')).toThrow(); // eslint-disable-line
    } catch (_) {} // eslint-disable-line
  });

  it('should resolve to a defined StitchClient', async() => {
    expect.assertions(2);

    const stitchClient = await StitchClientFactory.create(
      th.testApp.client_app_id,
      { baseUrl: th.serverUrl }
    );
    expect(stitchClient).toBeDefined();
	  const authedId = await stitchClient.authenticate('userpass', th.userCredentials);
	  expect(authedId).toBeDefined();
  });

  it('should allow closure access to a StitchClient', async() => {
	  expect.assertions(2);

    let factory = StitchClientFactory.create(th.testApp.client_app_id, { baseUrl: th.serverUrl });
  	await factory.then(stitchClient => {
  		expect(stitchClient).toBeDefined();
  		return stitchClient.authenticate('userpass', th.userCredentials);
  	}).then(userId => {
  		expect(userId).toBeDefined();
  	});
  });
});
