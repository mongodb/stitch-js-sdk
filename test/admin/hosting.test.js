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
  const FILE_HASH = md5(FILE_BODY);
  const FILE_ATTRS = [{ name: 'Content-Type', value: 'application/txt' }, { name: 'Content-Disposition', value: 'inline' }];
  const uploadTestFile = () => ({
    metadata: {
      appId: th.testApp._id,
      path: FILE_PATH,
      hash: FILE_HASH,
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
    let { metadata, body } = uploadTestFile();
    await hosting.assets().upload(JSON.stringify(metadata), body);
    let assets = await hosting.assets().list({ recursive: true });
    expect(assets).toHaveLength(1);
  });

  it('getting an asset should work', async() => {
    let { metadata, body } = uploadTestFile();
    await hosting.assets().upload(JSON.stringify(metadata), body);

    let asset = await hosting.assets().asset().get({ path: FILE_PATH });
    expect(asset.appId).toEqual(metadata.appId);
    expect(asset.path).toEqual(metadata.path);
    expect(asset.size).toEqual(metadata.size);
    expect(asset.hash).toEqual(metadata.hash);
    expect(asset.attrs).toEqual(metadata.attrs);
  });

  it('copying an asset should work', async() => {
    let { metadata, body } = uploadTestFile();
    let newPath = '/foo2';
    await hosting.assets().upload(JSON.stringify(metadata), body);
    await hosting.assets().post({ 'copy_from': FILE_PATH, 'copy_to': newPath });

    let original = await hosting.assets().asset().get({ path: FILE_PATH });
    let copy = await hosting.assets().asset().get({ path: newPath });
    expect(copy.appId).toEqual(original.appId);
    expect(copy.size).toEqual(original.size);
    expect(copy.hash).toEqual(original.hash);
    expect(copy.attrs).toEqual(original.attrs);
  });

  it('moving an asset should work', async() => {
    let { metadata, body } = uploadTestFile();
    let newPath = '/foo2';
    await hosting.assets().upload(JSON.stringify(metadata), body);
    await hosting.assets().post({ 'move_from': FILE_PATH, 'move_to': newPath });

    await expect(hosting.assets().asset().get({ path: FILE_PATH })).rejects.toBeDefined();
    let copy = await hosting.assets().asset().get({ path: newPath });
    expect(copy.appId).toEqual(metadata.appId);
    expect(copy.size).toEqual(metadata.size);
    expect(copy.hash).toEqual(metadata.hash);
    expect(copy.attrs).toEqual(metadata.attrs);
  });

  it('updating an asset should work', async() => {
    let { metadata, body } = uploadTestFile();
    await hosting.assets().upload(JSON.stringify(metadata), body);

    let newAttrs = [{ name: 'Content-Type', value: 'application/json' }];
    await expect(hosting.assets().asset().patch({ path: FILE_PATH, attributes: newAttrs })).resolves.toBeDefined();

    let newMetadata = await hosting.assets().asset().get({ path: FILE_PATH });
    expect(newMetadata.appId).toEqual(metadata.appId);
    expect(newMetadata.path).toEqual(metadata.path);
    expect(newMetadata.size).toEqual(metadata.size);
    expect(newMetadata.hash).toEqual(metadata.hash);
    expect(newMetadata.attrs).toEqual(newAttrs);
  });

  it('deleting an asset should work', async() => {
    let { metadata, body } = uploadTestFile();
    await hosting.assets().upload(JSON.stringify(metadata), body);
    let assets = await hosting.assets().list({ recursive: true });
    expect(assets).toHaveLength(1);

    await hosting.assets().asset().delete({ path: FILE_PATH });
    assets = await hosting.assets().list({ recursive: true });
    expect(assets).toHaveLength(0);
  });
});
