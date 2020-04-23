import { AssetMetadata, HostingConfig, TransformAssetRequest } from '../src/api/v3/Hosting';

import RealmMongoFixture from './fixtures/realm_mongo_fixture';
import { buildAdminTestHarness, extractTestFixtureDataPoints, randomString } from './testutil';

import md5 from 'md5';

describe('Hosting', () => {
  const test = new RealmMongoFixture();
  let th;
  let hosting;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    hosting = th.app().hosting();
  });

  afterEach(async () => th.cleanup());

  const FILE_PATH = '/foo';
  const FILE_BODY = 'testString';
  const FILE_HASH = md5(FILE_BODY);
  const FILE_ATTRS = [
    { name: 'Content-Type', value: 'application/txt' },
    { name: 'Content-Disposition', value: 'inline' },
  ];
  const createTestFile = (filePath = FILE_PATH) => ({
    metadata: new AssetMetadata({
      appId: th.testApp.id,
      path: filePath,
      hash: FILE_HASH,
      size: FILE_BODY.length,
      attributes: FILE_ATTRS,
    }),
    body: FILE_BODY,
  });

  it('listing assets of nonexistent directory gives error', () => {
    expect(hosting.assets().list()).rejects.toThrow();
  });

  it('creating an asset directory should work', async () => {
    const directoryPath = `/${randomString()}`;
    await hosting.assets().createDirectory(directoryPath);
    const assets = await hosting.assets().list();
    expect(assets[0].path).toEqual(`${directoryPath}/`);
  });

  it('invalidating cache should work', async () => {
    const directoryPath = `/${randomString()}`;
    await hosting.assets().createDirectory(directoryPath);
    await hosting.config().patch(new HostingConfig({ enabled: true }));
    const response = await hosting.cache().invalidate(directoryPath);
    expect(response.ok).toBeTruthy();
  });

  it('creating an asset should work', async () => {
    const filePath = `/${randomString()}`;
    const { metadata, body } = createTestFile(filePath);
    await hosting.assets().upload(metadata, body);
    const assets = await hosting.assets().list('', true);
    expect(assets).toHaveLength(1);
  });

  it('getting an asset should work', async () => {
    const filePath = `/${randomString()}`;
    const { metadata, body } = createTestFile(filePath);
    await hosting.assets().upload(metadata, body);

    const asset = await hosting.assets().asset(filePath).get();
    expect(asset.appId).toEqual(metadata.appId);
    expect(asset.path).toEqual(metadata.path);
    expect(asset.size).toEqual(metadata.size);
    expect(asset.hash).toEqual(metadata.hash);
    expect(asset.attributes).toEqual(metadata.attributes);
  });

  it('getting assets by prefix should work', async () => {
    const file1 = createTestFile('/foo/1');
    const file2 = createTestFile('/foo/2');
    const file3 = createTestFile('/bar');
    await hosting.assets().upload(file1.metadata, file1.body);
    await hosting.assets().upload(file2.metadata, file2.body);
    await hosting.assets().upload(file3.metadata, file3.body);

    const assets = await hosting.assets().list('/foo/', true);
    expect(assets).toHaveLength(2);
  });

  it('copying an asset should work', async () => {
    const filePath = `/${randomString()}`;
    const { metadata, body } = createTestFile(filePath);
    const newPath = '/foo2';
    await hosting.assets().upload(metadata, body);
    await hosting.assets().transform(new TransformAssetRequest({ copyFrom: filePath, copyTo: newPath }));

    const original = await hosting.assets().asset(filePath).get();
    const copy = await hosting.assets().asset(newPath).get();
    expect(copy.appId).toEqual(original.appId);
    expect(copy.size).toEqual(original.size);
    expect(copy.hash).toEqual(original.hash);
    expect(copy.attributes).toEqual(original.attributes);
  });

  it('moving an asset should work', async () => {
    const filePath = `/${randomString()}`;
    const { metadata, body } = createTestFile(filePath);
    const newPath = '/foo2';
    await hosting.assets().upload(metadata, body);
    await hosting.assets().transform(new TransformAssetRequest({ moveFrom: filePath, moveTo: newPath }));

    await expect(hosting.assets().asset(filePath).get()).rejects.toBeDefined();
    const copy = await hosting.assets().asset(newPath).get();
    expect(copy.appId).toEqual(metadata.appId);
    expect(copy.size).toEqual(metadata.size);
    expect(copy.hash).toEqual(metadata.hash);
    expect(copy.attributes).toEqual(metadata.attributes);
  });

  it('updating an asset should work', async () => {
    const filePath = `/${randomString()}`;
    const { metadata, body } = createTestFile(filePath);
    await hosting.assets().upload(metadata, body);

    const newAttrs = [{ name: 'Content-Type', value: 'application/json' }];
    await expect(hosting.assets().asset(filePath).patch({ attributes: newAttrs })).resolves.toBeDefined();

    const newMetadata = await hosting.assets().asset(filePath).get();
    expect(newMetadata.appId).toEqual(metadata.appId);
    expect(newMetadata.path).toEqual(metadata.path);
    expect(newMetadata.size).toEqual(metadata.size);
    expect(newMetadata.hash).toEqual(metadata.hash);
    expect(newMetadata.attributes).toEqual(newAttrs);
  });

  it('deleting an asset should work', async () => {
    const filePath = `/${randomString()}`;
    const { metadata, body } = createTestFile(filePath);
    await hosting.assets().upload(metadata, body);
    let assets = await hosting.assets().list('', true);
    expect(assets).toHaveLength(1);

    await hosting.assets().asset(filePath).delete();
    assets = await hosting.assets().list('', true);
    expect(assets).toHaveLength(0);
  });
});
