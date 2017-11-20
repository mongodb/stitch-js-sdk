const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildClientTestHarness, extractTestFixtureDataPoints } from '../testutil';

const FUNC_NAME = 'myFunction';

describe('Client API executing named functions', () => {
  let test = new StitchMongoFixture();
  let th;
  let client;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildClientTestHarness(apiKey, groupId, serverUrl);
    client = th.stitchClient;
  });

  afterEach(async() => th.cleanup());

  it('Should be successful', async() => {
    await th.app().functions().create({
      name: FUNC_NAME,
      source: 'exports = function(arg1, arg2){ return {sum: arg1 + arg2, userId: context.user.id}}'
    });

    const result = await client.executeFunction(
      FUNC_NAME,
      777,
      23,
    );

    expect(result.sum).toEqual(800);
    expect(result.userId).toEqual(th.user._id);
  });
});
