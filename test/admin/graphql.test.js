const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildAdminTestHarness,
  extractTestFixtureDataPoints } from '../testutil';

describe('graphql', () => {
  let test = new StitchMongoFixture();
  let th;
  let graphql;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);

    const service = await th.app().services().create({
      name: 'test',
      type: 'mongodb',
      config: {
        uri: 'mongodb://localhost:26000'
      }
    });

    await th.app().services().service(service._id).rules().create({
      database: 'db',
      collection: 'coll',
      schema: {
        properties: {
          firstName: {
            type: 'string'
          }
        }
      }
    });

    graphql = th.app().graphql();
  });

  afterEach(async() => th.cleanup());

  it('exposes a .post() which executes a graphql request', async() => {
    const response = await graphql.post({ query: '{ __schema { queryType { name } } }' });
    expect(response).toEqual({
      data: {
        __schema: {
          queryType: {
            name: 'Query'
          }
        }
      }
    });
  });

  it('exposes .validate() which properly executes the request to validate a schema', async() => {
    const response = await graphql.validate();
    expect(response).toEqual([]);
  });

  describe('custom_resolvers', () => {
    let myResolver;
    beforeEach(async(done) => {
      myResolver = await graphql.customResolvers().create({
        field_name: 'myResolver',
        on_type: 'Query',
        function_id: '5a1154523a6bcc1d245e143d'
      });

      done();
    });

    it('.list', async() => {
      const response = await graphql.customResolvers().list();
      expect(response).toEqual([myResolver]);
    });

    it('.create', async() => {
      expect(myResolver).toMatchObject({
        field_name: 'myResolver',
        function_id: '5a1154523a6bcc1d245e143d',
        on_type: 'Query'
      });
    });

    it('.get', async() => {
      const response = await graphql.customResolvers().customResolver(myResolver._id).get();
      expect(response).toEqual(myResolver);
    });

    it('.update', async() => {
      const update = Object.assign({}, myResolver, { on_type: 'Mutation'});
      const response = await graphql.customResolvers().customResolver(myResolver._id).update(update);
      expect(response.status).toEqual(204);
    });

    it('.remove', async() => {
      await graphql.customResolvers().customResolver(myResolver._id).remove();
      const response = await graphql.customResolvers().list();
      expect(response).toEqual([]);
    });
  });
});
