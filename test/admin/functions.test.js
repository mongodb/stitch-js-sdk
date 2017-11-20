const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

describe('Functions', () => {
  let test = new StitchMongoFixture();
  let th;
  let functions;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    functions = th.app().functions();
  });

  afterEach(async() => th.cleanup());

  const FUNC_NAME = 'myFunction';
  const FUNC_SOURCE = 'exports = function(){ return "hello world!"; }';
  const createTestFunction = () => ({ name: FUNC_NAME, source: FUNC_SOURCE });

  const FUNC_UPDATED_NAME = 'myFunction';
  const FUNC_UPDATED_SOURCE = 'exports = function(){ return "!dlrow olleh"; }';
  const createUpdatedFunction = () => ({ name: FUNC_UPDATED_NAME, source: FUNC_UPDATED_SOURCE });

  it('listing functions should return an empty list', async() => {
    let funcs = await functions.list();
    expect(funcs).toHaveLength(0);
  });

  it('creating functions should work', async() => {
    let func = await functions.create(createTestFunction());
    expect(func.name).toEqual(FUNC_NAME);

    let funcs = await functions.list();
    expect(funcs).toHaveLength(1);
    expect(funcs[0].name).toEqual(FUNC_NAME);
  });

  it('invalid create requests should fail', async() => {
    await expect(functions.create({ name: '' })).rejects.toBeDefined();
  });

  it('fetching function should work', async() => {
    let newFunc = await functions.create(createTestFunction());
    expect(newFunc._id).toBeTruthy();

    let func = await functions.function(newFunc._id).get();
    expect(func.name).toEqual(FUNC_NAME);
    expect(func.source).toEqual(FUNC_SOURCE);
  });

  it('deleting function should work', async() => {
    let func = await functions.create(createTestFunction());
    expect(func._id).toBeTruthy();

    let funcs = await functions.list();
    expect(funcs).toHaveLength(1);

    await functions.function(func._id).remove();

    funcs = await functions.list();
    expect(funcs).toHaveLength(0);
  });

  it('updating function should work', async() => {
    let func = await functions.create(createTestFunction());
    expect(func._id).toBeTruthy();

    await functions.function(func._id).update(createUpdatedFunction());

    let updatedFunc = await functions.function(func._id).get();
    expect(updatedFunc.name).toEqual(FUNC_UPDATED_NAME);
    expect(updatedFunc.source).toEqual(FUNC_UPDATED_SOURCE);
  });
});
