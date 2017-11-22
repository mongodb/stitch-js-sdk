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

// the below test is only supported in the deprecated v2 api
// once the ability to query for both named pipelines and incoming webhooks with pipelines
// is no longer needed, this can be removed.

async function createTestPipeline(appPipelines) {
  const pipelineName = 'testPipelineName';
  const testPipeline = {
    name: pipelineName,
    pipeline: [
      {
        service: '',
        action: 'literal',
        args: {
          items: '%%vars.data'
        },
        let: {
          data: '%%args.vals'
        }
      }
    ],
    parameters: [
      { name: 'vals', 'required': true }
    ],
    output: 'array'
  };

  const pipeline = await appPipelines.create(testPipeline);
  expect(pipeline.name).toEqual(pipelineName);
  const pipelines = await appPipelines.list();
  expect(pipelines).toHaveLength(1);
}

describe('Dev Pipeline (V2)', () => {
  let test = new StitchMongoFixture();
  let th;
  let dev;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const {
      userData: {
        apiKey: { key: apiKey },
        group: { groupId }
      },
      options: { baseUrl: serverUrl }
    } = test;
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    await th.configureUserpass();
    await th.createUser();

    dev = th.appV2().dev();
    await createTestPipeline(th.appV2().pipelines());
  });

  afterEach(async() => th.app().remove());

  it('Supports executing the pipeline', async() => {
    const { result } = await dev.executePipeline([
      {
        service: '',
        action: 'namedPipeline',
        args: {
          name: 'testPipelineName',
          args: {
            vals: [1, 2, 3]
          }
        }
      }
    ], th.user._id);

    expect(result[0]).toEqual([
      { '$numberInt': '1' },
      { '$numberInt': '2' },
      { '$numberInt': '3' }
    ]);
  });
});
