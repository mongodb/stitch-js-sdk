const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import md5 from 'md5';
import { buildAdminTestHarness, extractTestFixtureDataPoints } from '../testutil';

describe('Hosting', () => {
  let test = new StitchMongoFixture();
  let th;
  let hosting;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    hosting = th.app().hosting();
  });

  afterEach(async() => th.cleanup());

  const FILE_PATH = '/foo';
  const FILE_BODY = 'testString';
  const FILE_ATTRS = [{ name: 'Content-Type', value: 'application/txt'}, { name: 'Content-Disposition', value: 'inline' }];
  const createTestFile = () => ({
    metadata: {
      appId: th.testApp._id,
      path: FILE_PATH,
      hash: md5(FILE_BODY),
      size: FILE_BODY.length,
      attrs: FILE_ATTRS
    },
    body: FILE_BODY
  });

  it('listing assets when there are none should return an empty list', async() => {
    let assets = await hosting.assets().list();
    expect(assets).toHaveLength(0);
  });

  it('creating an asset should work', async() => {
    let { metadata, body } = createTestFile();
    await hosting.assets().create(JSON.stringify(metadata), body);
    let assets = await hosting.assets().list({ recursive: true });
    expect(assets).toHaveLength(1);
  });

  it('getting an asset should work', async() => {
    let { metadata, body } = createTestFile();
    await hosting.assets().create(JSON.stringify(metadata), body);

    let asset = await hosting.assets().asset().get({ path: FILE_PATH });
    expect(asset.path).toEqual(FILE_PATH);
  });

  it('deleting an asset should work', async() => {
    let { metadata, body } = createTestFile();
    await hosting.assets().create(JSON.stringify(metadata), body);
    let assets = await hosting.assets().list({ recursive: true });
    expect(assets).toHaveLength(1);

    await hosting.assets().asset().delete({ path: FILE_PATH });
    assets = await hosting.assets().list({ recursive: true });
    expect(assets).toHaveLength(0);
  });
});
