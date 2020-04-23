import { CustomResolver, GraphQLResolverType } from '../src/api/v3/GraphQL';
import { MongoDBRule } from '../src/api/v3/Rules';
import { ServiceDesc } from '../src/api/v3/Services';

import RealmMongoFixture from './fixtures/realm_mongo_fixture';
import { buildAdminTestHarness, extractTestFixtureDataPoints } from './testutil';

describe('graphql', () => {
  const test = new RealmMongoFixture();
  let th;
  let graphql;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);

    const service = await th
      .app()
      .services()
      .create(
        new ServiceDesc({
          name: 'test',
          type: 'mongodb',
          config: {
            uri: 'mongodb://localhost:26000',
          },
        })
      );

    await th
      .app()
      .services()
      .service(service.id)
      .rules()
      .create(
        new MongoDBRule({
          database: 'db',
          collection: 'coll',
          schema: {
            properties: {
              firstName: {
                type: 'string',
              },
            },
          },
        })
      );

    graphql = th.app().graphql();
  });

  afterEach(async () => th.cleanup());

  it('exposes a .post() which executes a graphql request', async () => {
    const response = await graphql.post({
      query: '{ __schema { queryType { name } } }',
    });
    expect(response).toEqual({
      data: {
        __schema: {
          queryType: {
            name: 'Query',
          },
        },
      },
    });
  });

  it('exposes .validate() which properly executes the request to validate a schema', async () => {
    const response = await graphql.validate();
    expect(response).toEqual([]);
  });

  describe('custom_resolvers', () => {
    let myResolver;
    beforeEach(async (done) => {
      myResolver = await graphql.customResolvers().create(
        new CustomResolver({
          fieldName: 'myResolver',
          onType: GraphQLResolverType.Query,
          functionId: '5a1154523a6bcc1d245e143d',
        })
      );

      done();
    });

    it('.list', async () => {
      const response = await graphql.customResolvers().list();
      expect(response).toEqual([myResolver]);
    });

    it('.create', async () => {
      myResolver.id = undefined;
      expect(myResolver).toMatchObject(
        new CustomResolver({
          fieldName: 'myResolver',
          functionId: '5a1154523a6bcc1d245e143d',
          onType: GraphQLResolverType.Query,
        })
      );
    });

    it('.get', async () => {
      const response = await graphql.customResolvers().customResolver(myResolver.id).get();
      expect(response).toEqual(myResolver);
    });

    it('.update', async () => {
      const update = new CustomResolver({
        ...myResolver,
        onType: GraphQLResolverType.Mutation,
      });
      const response = await graphql.customResolvers().customResolver(myResolver.id).update(update);
      expect(response.status).toEqual(204);
    });

    it('.remove', async () => {
      await graphql.customResolvers().customResolver(myResolver.id).remove();
      const response = await graphql.customResolvers().list();
      expect(response).toEqual([]);
    });
  });
});
