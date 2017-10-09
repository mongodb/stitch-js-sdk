
const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import {getAuthenticatedClient} from '../testutil';

describe('Pipelines V2', ()=>{
  let test = new StitchMongoFixture();
  let apps;
  let app;
  beforeAll(() => test.setup({createApp: false}));
  afterAll(() => test.teardown());
  beforeEach(async () =>{
    let adminClient = await getAuthenticatedClient(test.userData.apiKey.key);
    test.groupId = test.userData.group.groupId;
    apps = await adminClient.v2().apps(test.groupId);
    app = await apps.create({name: 'testname'});
    appPipelines = adminClient.v2().apps(test.groupId).app(app._id).pipelines();
  });
  afterEach(async () => {
    await apps.app(app._id).remove();
  });

  let appPipelines;
  const testPipelineName = 'testpipelinename';
  const testPipeline = {
    name: testPipelineName,
    pipeline: [
      {service: '', action: 'literal', args: {items: [1, 2, 3]}}
    ],
    output: 'singleDoc'
  };
  it('listing pipelines should return empty list', async () => {
    let pipelines = await appPipelines.list();
    expect(pipelines).toEqual([]);
  });
  it('creating pipeline should make it appear in list', async () => {
    let pipeline = await appPipelines.create(testPipeline);
    expect(pipeline.name).toEqual(testPipelineName);
    let pipelines = await appPipelines.list();
    expect(pipelines).toHaveLength(1);
    expect(pipelines[0]).toEqual(pipeline);
  });
  it('fetching a pipeline works', async () => {
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
  it('can update a pipeline', async () => {
    let pipeline = await appPipelines.create(testPipeline);
    let pipelineUpdated = Object.assign({}, testPipeline, {_id: pipeline._id});
    pipelineUpdated.pipeline[0].args.items = ['a', 'b', 'c'];
    await appPipelines.pipeline(pipeline._id).update(pipelineUpdated);
    const deepPipeline = await appPipelines.pipeline(pipeline._id).get();
    expect(deepPipeline.pipeline[0].args.items).toEqual(['a', 'b', 'c']);
  });
  it('can delete a pipeline', async () => {
    let pipeline = await appPipelines.create(testPipeline);
    let pipelines = await appPipelines.list();
    expect(pipelines).toHaveLength(1);
    await appPipelines.pipeline(pipeline._id).remove();
    pipelines = await appPipelines.list();
    expect(pipelines).toHaveLength(0);
  });
});
