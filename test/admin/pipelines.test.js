const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

// the below tests are only supported in the deprecated v2 api
// once the ability to query for both named pipelines and incoming webhooks with pipelines
// is no longer needed, this can be removed.

describe('Pipelines (V2)', ()=>{
  let test = new StitchMongoFixture();
  let th;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    appPipelines = th.appV2().pipelines();
  });

  afterEach(async() => th.cleanup());

  let appPipelines;
  const testPipelineName = 'testpipelinename';
  const testPipeline = {
    name: testPipelineName,
    pipeline: [
      {service: '', action: 'literal', args: {items: [1, 2, 3]}}
    ],
    output: 'singleDoc'
  };
  it('listing pipelines should return empty list', async() => {
    let pipelines = await appPipelines.list();
    expect(pipelines).toEqual([]);
  });
  it('creating pipeline should make it appear in list', async() => {
    let pipeline = await appPipelines.create(testPipeline);
    expect(pipeline.name).toEqual(testPipelineName);
    let pipelines = await appPipelines.list();
    expect(pipelines).toHaveLength(1);
    expect(pipelines[0]).toEqual(pipeline);
  });
  it('fetching a pipeline works', async() => {
    let pipeline = await appPipelines.create(testPipeline);
    const deepPipeline = await appPipelines.pipeline(pipeline._id).get();
    expect(deepPipeline.pipeline).toEqual(testPipeline.pipeline);
    // remove the non-shallow parts
    delete deepPipeline.pipeline;
    delete deepPipeline.output;
    delete deepPipeline.private;
    delete deepPipeline.skip_rules;
    expect(pipeline).toEqual(deepPipeline);
  });
  it('can update a pipeline', async() => {
    let pipeline = await appPipelines.create(testPipeline);
    let pipelineUpdated = Object.assign({}, testPipeline, {_id: pipeline._id});
    pipelineUpdated.pipeline[0].args.items = ['a', 'b', 'c'];
    await appPipelines.pipeline(pipeline._id).update(pipelineUpdated);
    const deepPipeline = await appPipelines.pipeline(pipeline._id).get();
    expect(deepPipeline.pipeline[0].args.items).toEqual(['a', 'b', 'c']);
  });
  it('can delete a pipeline', async() => {
    let pipeline = await appPipelines.create(testPipeline);
    let pipelines = await appPipelines.list();
    expect(pipelines).toHaveLength(1);
    await appPipelines.pipeline(pipeline._id).remove();
    pipelines = await appPipelines.list();
    expect(pipelines).toHaveLength(0);
  });
});
