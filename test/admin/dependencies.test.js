import StitchMongoFixture from '../fixtures/stitch_mongo_fixture';
import {
  buildAdminTestHarness,
  extractTestFixtureDataPoints
} from '../testutil';
import fs from 'fs';

const UPLOADED_DEPS = [
  { name: 'axios', version: '0.19.0' },
  { name: 'debug', version: '3.1.0' },
  { name: 'follow-redirects', version: '1.5.10' },
  { name: 'is-buffer', version: '2.0.4' }
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

  it('listing dependencies should return an empty array when there are no dependencies', async() => {
    let deps = await dependencies.list();
    expect(deps.dependencies_list).toHaveLength(0);
  });

  describe('creating dependencies should work', () => {
    let filePath;
    let fileBody;

    beforeEach(async() => {
      filePath = 'axios-0.19.0-node_modules.tar';
      fileBody = fs.readFileSync(`./test/admin/testdata/${filePath}`);
    });

    it('and upload the correct packages', async() => {
      const response = await dependencies.upload(filePath, fileBody);
      expect(response.status).toBe(204);

      let deps = await dependencies.list();
      const sortedDependencies = deps.dependencies_list.sort((a, b) =>
        a.name > b.name ? 1 : -1
      );
      expect(sortedDependencies).toEqual(UPLOADED_DEPS);
    });
  });
});
