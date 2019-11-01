import StitchMongoFixture from "../fixtures/stitch_mongo_fixture";
// import FormData from "form-data";
import md5 from 'md5';
import {
  buildAdminTestHarness,
  extractTestFixtureDataPoints,
  randomString
} from "../testutil";

const FILE_PATH = "/foo";
const FILE_BODY = "testString";
const FILE_HASH = md5(FILE_BODY);
const FILE_ATTRS = [
  { name: "Content-Type", value: "application/txt" },
  { name: "Content-Disposition", value: "inline" }
];

describe("Dependencies", () => {
  let test = new StitchMongoFixture();
  let th;
  let dependencies;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    dependencies = th.app().dependencies();
  });

  afterEach(async () => th.cleanup());

  it("listing dependencies should return an error when there are no dependencies", async () => {
    let deps = dependencies.list();
    await expect(deps).rejects.toBeDefined();
  });

  it("creating dependencies should work", async () => {
    const filePath = './package.json';
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
    let { metadata, body } = createTestFile(filePath);
    await dependencies.upload(JSON.stringify(metadata), body);
  });
});
