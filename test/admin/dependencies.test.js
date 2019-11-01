import StitchMongoFixture from '../fixtures/stitch_mongo_fixture';
import {
  buildAdminTestHarness,
  extractTestFixtureDataPoints
} from '../testutil';
import fs from 'fs';

const UPLOADED_DEPS = [
  { name: 'debug', version: '3.1.0' },
  { name: 'axios', version: '0.19.0' },
  { name: 'is-buffer', version: '2.0.4' },
  { name: 'follow-redirects', version: '1.5.10' }
];

describe('Dependencies', () => {
  let test = new StitchMongoFixture();
  let th;
  let dependencies;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    dependencies = th.app().dependencies();
  });

  afterEach(async() => th.cleanup());

  it('listing dependencies should return an error when there are no dependencies', async() => {
    let deps = dependencies.list();
    await expect(deps).rejects.toBeDefined();
  });

  describe('creating dependencies should work', () => {
    beforeEach(async() => {
      const filePath = 'axios-0.19.0-node_modules.tar';
      const fileBody = fs.readFileSync(
        './test/admin/testdata/axios-0.19.0-node_modules.tar'
      );
      await dependencies.upload(filePath, fileBody);
    });

    it('and upload the correct packages', async() => {
      let deps = await dependencies.list();
      expect(deps.dependencies_list).toHaveLength(4);
      expect(deps.dependencies_list).toMatchObject(UPLOADED_DEPS);
    });
  });
});
