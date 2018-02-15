import { StitchAdminClient, StitchAdminClientFactory } from '../../src/admin';
import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';
import StitchMongoFixture from '../fixtures/stitch_mongo_fixture';

describe('StitchAdminClient', () => {
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

  it('should not allow instantiation of StitchAdminClient', async() => {
    expect(() => new StitchAdminClient()).toThrowError(
      /StitchAdminClient can only be made from the StitchAdminClientFactory\.create function/
    );
  });

  it('should not allow instantiation of StitchAdminClientFactory', async() => {
    expect(() => new StitchAdminClientFactory()).toThrowError(
      /StitchAdminClient can only be made from the StitchAdminClientFactory\.create function/
    );
  });

  it('should resolve to a defined StitchAdminClient', async() => {
    const stitchAdminClient = await StitchAdminClientFactory.create(
      th.testApp.client_app_id,
      { baseUrl: th.serverUrl }
    );
    expect(stitchAdminClient).toBeDefined();
  });
});
