const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

describe('Admin Users', () => {
  let test = new StitchMongoFixture();
  let th;
  let adminClient;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    adminClient = th.adminClient;
  });

  afterEach(async() => th.cleanup());

  it('should list the user profile for the authenticated admin user', async() => {
    expect.assertions(3);

    const { roles } = await adminClient.userProfile();
    expect(roles).toBeDefined();
    expect(roles.length).toBe(1);
    expect(roles[0].role_name).toBe('groupOwner');
  });

  it('should list the available authentication providers for the admin console', async() => {
    const resp = await adminClient.getAuthProviders();
    expect(Array.isArray(resp)).toBe(true);
  });

  it('should allow a session POST', async() => {
    const response = await adminClient.doSessionPost();
    expect(response.access_token).toBeDefined();
  });
});
