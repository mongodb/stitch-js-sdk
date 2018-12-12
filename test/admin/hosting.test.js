const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import md5 from 'md5';
import { buildAdminTestHarness, extractTestFixtureDataPoints, randomString } from '../testutil';

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
  const createTestFile = (filePath = FILE_PATH) => ({
    metadata: {
      appId: th.testApp._id,
      path: filePath,
      hash: FILE_HASH,
      size: FILE_BODY.length,
      attrs: FILE_ATTRS
    },
    body: FILE_BODY
  });

  it('listing assets of nonexistent directory gives error', () => {
    expect(hosting.assets().list()).rejects.toThrow();
  });

  it('creating an asset directory should work', async() => {
    const directoryPath = `/${randomString()}`;
    await hosting.assets().createDirectory(directoryPath);
    let assets = await hosting.assets().list({});
    expect(assets[0].path).toEqual(`${directoryPath}/`);
  });

  it('invalidating cache should work', async() => {
    const directoryPath = `/${randomString()}`;
    await hosting.assets().createDirectory(directoryPath);
    await hosting.config().patch({ enabled: true });
    let response = await hosting.cache().invalidate(directoryPath);
    expect(response.ok).toBeTruthy();
  });

  it('creating an asset should work', async() => {
    const filePath = `/${randomString()}`;
    let { metadata, body } = createTestFile(filePath);
    await hosting.assets().upload(JSON.stringify(metadata), body);
    let assets = await hosting.assets().list({ recursive: true });
    expect(assets).toHaveLength(1);
  });

  it('getting an asset should work', async() => {
    const filePath = `/${randomString()}`;
    let { metadata, body } = createTestFile(filePath);
    await hosting.assets().upload(JSON.stringify(metadata), body);

    let asset = await hosting.assets().asset().get({ path: filePath });
    expect(asset.appId).toEqual(metadata.appId);
    expect(asset.path).toEqual(metadata.path);
    expect(asset.size).toEqual(metadata.size);
    expect(asset.hash).toEqual(metadata.hash);
    expect(asset.attrs).toEqual(metadata.attrs);
  });

  it('getting assets by prefix should work', async() => {
    let file1 = createTestFile('/foo/1');
    let file2 = createTestFile('/foo/2');
    let file3 = createTestFile('/bar');
    await hosting.assets().upload(JSON.stringify(file1.metadata), file1.body);
    await hosting.assets().upload(JSON.stringify(file2.metadata), file2.body);
    await hosting.assets().upload(JSON.stringify(file3.metadata), file3.body);

    let assets = await hosting.assets().list({ prefix: '/foo/', recursive: true });
    expect(assets).toHaveLength(2);
  });

  it('copying an asset should work', async() => {
    const filePath = `/${randomString()}`;
    let { metadata, body } = createTestFile(filePath);
    let newPath = '/foo2';
    await hosting.assets().upload(JSON.stringify(metadata), body);
    await hosting.assets().post({ 'copy_from': filePath, 'copy_to': newPath });

    let original = await hosting.assets().asset().get({ path: filePath });
    let copy = await hosting.assets().asset().get({ path: newPath });
    expect(copy.appId).toEqual(original.appId);
    expect(copy.size).toEqual(original.size);
    expect(copy.hash).toEqual(original.hash);
    expect(copy.attrs).toEqual(original.attrs);
  });

  it('moving an asset should work', async() => {
    const filePath = `/${randomString()}`;
    let { metadata, body } = createTestFile(filePath);
    let newPath = '/foo2';
    await hosting.assets().upload(JSON.stringify(metadata), body);
    await hosting.assets().post({ 'move_from': filePath, 'move_to': newPath });

    await expect(hosting.assets().asset().get({ path: filePath })).rejects.toBeDefined();
    let copy = await hosting.assets().asset().get({ path: newPath });
    expect(copy.appId).toEqual(metadata.appId);
    expect(copy.size).toEqual(metadata.size);
    expect(copy.hash).toEqual(metadata.hash);
    expect(copy.attrs).toEqual(metadata.attrs);
  });

  it('updating an asset should work', async() => {
    const filePath = `/${randomString()}`;
    let { metadata, body } = createTestFile(filePath);
    await hosting.assets().upload(JSON.stringify(metadata), body);

    let newAttrs = [{ name: 'Content-Type', value: 'application/json' }];
    await expect(hosting.assets().asset().patch({ path: filePath, attributes: newAttrs })).resolves.toBeDefined();

    let newMetadata = await hosting.assets().asset().get({ path: filePath });
    expect(newMetadata.appId).toEqual(metadata.appId);
    expect(newMetadata.path).toEqual(metadata.path);
    expect(newMetadata.size).toEqual(metadata.size);
    expect(newMetadata.hash).toEqual(metadata.hash);
    expect(newMetadata.attrs).toEqual(newAttrs);
  });

  it('deleting an asset should work', async() => {
    const filePath = `/${randomString()}`;
    let { metadata, body } = createTestFile(filePath);
    await hosting.assets().upload(JSON.stringify(metadata), body);
    let assets = await hosting.assets().list({ recursive: true });
    expect(assets).toHaveLength(1);

    await hosting.assets().asset().delete({ path: filePath });
    assets = await hosting.assets().list({ recursive: true });
    expect(assets).toHaveLength(0);
  });
});
