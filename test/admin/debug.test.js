const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

const FUNC_NAME = 'myFunction';
const FUNC_SOURCE = 'exports = function(arg1, arg2){ return {sum: arg1 + arg2, userId: context.user.id}}';

async function createTestFunction(functions) {
  let func = await functions.create({ name: FUNC_NAME, source: FUNC_SOURCE });
  expect(func.name).toEqual(FUNC_NAME);

  let funcs = await functions.list();
  expect(funcs).toHaveLength(1);
  expect(funcs[0].name).toEqual(FUNC_NAME);
}

describe('Debugging functions', () => {
  let test = new StitchMongoFixture();
  let th;
  let debug;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    await th.configureUserpass();
    await th.createUser();

    debug = th.app().debug();
    await createTestFunction(th.app().functions());
  });

  afterEach(async() => th.cleanup());

  it('Supports executing the function', async() => {
    const result = await debug.executeFunction(
      th.user._id,
      FUNC_NAME,
      777,
      23,
    );

    expect(result.result.sum).toEqual({'$numberDouble': '800'});
    expect(result.result.userId).toEqual(th.user._id);
  });

  it('Supports executing a function source with an eval script', async() => {
    const result = await debug.executeFunctionSource(
      th.user._id,
      'exports = function(arg1, arg2) { return {sum: 800 + arg1 + arg2, userId: context.user.id } }',
      'exports(1,5)',
    );

    expect(result.result.sum).toEqual({'$numberDouble': '806'});
    expect(result.result.userId).toEqual(th.user._id);
  });
});

