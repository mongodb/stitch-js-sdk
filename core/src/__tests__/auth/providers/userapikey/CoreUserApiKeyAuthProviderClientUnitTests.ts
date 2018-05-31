import { ObjectID } from "bson";
import {
  anything,
  capture,
  instance,
  mock,
  verify,
  when
} from "ts-mockito/lib/ts-mockito";
import {
  CoreStitchAuth,
  CoreUserAPIKeyAuthProviderClient,
  StitchAppRoutes,
  UserAPIKey
} from "../../../../lib";
import Method from "../../../../lib/internal/net/Method";
import { StitchAuthDocRequest } from "../../../../lib/internal/net/StitchAuthDocRequest";
import { StitchAuthRequest } from "../../../../lib/internal/net/StitchAuthRequest";
import { StitchRequest } from "../../../../lib/internal/net/StitchRequest";
import { RequestClassMatcher } from "../../../APITestUtils";

function testClientCall(
  fun: (CoreUserApiKeyAuthProviderClient) => Promise<any>,
  ignoresResponse: boolean,
  expectedRequest: StitchAuthRequest,
  keyToFetch?: string
): Promise<any> {
  const clientAppId = "my_app-12345";

  const requestClientMock = mock(CoreStitchAuth);
  const requestClient = instance(requestClientMock);

  const routes = new StitchAppRoutes(clientAppId).authRoutes;

  const client = new class extends CoreUserAPIKeyAuthProviderClient {
    constructor() {
      super(requestClient, routes);
    }
  }();

  when(
    requestClientMock.doAuthenticatedRequest(new RequestClassMatcher(
      undefined,
      Method.POST
    ) as any)
  ).thenResolve({
    body: JSON.stringify(
      new UserAPIKey(new ObjectID().toHexString(), "2", "3", false)
    ),
    headers: {},
    statusCode: 200,
  });

  when(
    requestClientMock.doAuthenticatedRequest(new RequestClassMatcher(
      new RegExp(".*/api_keys$"),
      Method.GET
    ) as any)
  ).thenResolve({
    body: JSON.stringify([
      new UserAPIKey(new ObjectID().toHexString(), "2", "3", false)
    ]),
    headers: {},
    statusCode: 200,
  });

  when(
    requestClientMock.doAuthenticatedRequest(new RequestClassMatcher(
      new RegExp(`.*\/${keyToFetch}$`),
      Method.GET
    ) as any)
  ).thenResolve({
    body: JSON.stringify(
      new UserAPIKey(new ObjectID().toHexString(), "2", "3", false)
    ),
    headers: {},
    statusCode: 200,
  });

  when(
    requestClientMock.doAuthenticatedRequest(new RequestClassMatcher(
      new RegExp(`.*\/enable$`)
    ) as any)
  ).thenResolve({
    headers: {},
    statusCode: 200,
  });

  when(
    requestClientMock.doAuthenticatedRequest(new RequestClassMatcher(
      new RegExp(`.*\/disable$`)
    ) as any)
  ).thenResolve({
    headers: {},
    statusCode: 200,
  });

  when(
    requestClientMock.doAuthenticatedRequest(new RequestClassMatcher(
      undefined,
      Method.DELETE
    ) as any)
  ).thenResolve({
    headers: {},
    statusCode: 200,
  });

  return fun(client)
    .then(() => {
      if (ignoresResponse) {
        verify(requestClientMock.doAuthenticatedRequest(anything())).times(1);
      } else {
        verify(requestClientMock.doAuthenticatedRequest(anything())).times(1);
      }

      const [requestArg] = capture(
        requestClientMock.doAuthenticatedRequest
      ).last();

      expect(expectedRequest).toEqualRequest(requestArg);

      // Should pass along errors
      when(requestClientMock.doAuthenticatedRequest(anything())).thenThrow(
        new Error("whoops")
      );

      return fun(client);
    })
    .catch((err: Error) => {
      if (err.message !== "whoops") {
        fail(err);
      }
      expect(err.message).toEqual("whoops");
    });
}

describe("CoreUserApiKeyAuthProviderClientUnitTests", () => {
  it("should create api key", () => {
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const apiKeyName = "api_key_name";
    const expectedRequestBuilder = new StitchAuthDocRequest.Builder();
    expectedRequestBuilder
      .withMethod(Method.POST)
      .withPath(routes.baseAuthRoute + "/api_keys")
      .withRefreshToken()
      .withShouldRefreshOnFailure(false)
      .withDocument({ name: apiKeyName });

    return testClientCall(
      (client: CoreUserAPIKeyAuthProviderClient) => {
        return client.createApiKey(apiKeyName);
      },
      false,
      expectedRequestBuilder.build()
    );
  });

  it("should fetch api key", () => {
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const keyToFetch = new ObjectID();
    const expectedRequestBuilder = new StitchAuthRequest.Builder();
    expectedRequestBuilder
      .withMethod(Method.GET)
      .withPath(routes.baseAuthRoute + "/api_keys/" + keyToFetch.toHexString())
      .withRefreshToken()
      .withShouldRefreshOnFailure(false);

    return testClientCall(
      (client: CoreUserAPIKeyAuthProviderClient) => {
        return client.fetchApiKey(keyToFetch);
      },
      false,
      expectedRequestBuilder.build(),
      keyToFetch.toHexString()
    );
  });

  it("should fetch api keys", () => {
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const expectedRequestBuilder = new StitchAuthRequest.Builder();
    expectedRequestBuilder
      .withMethod(Method.GET)
      .withPath(routes.baseAuthRoute + "/api_keys")
      .withRefreshToken()
      .withShouldRefreshOnFailure(false);
    return testClientCall(
      client => {
        return client.fetchApiKeys();
      },
      false,
      expectedRequestBuilder.build()
    );
  });

  it("should enable api key", () => {
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const keyToEnable = new ObjectID();
    const expectedRequestBuilder = new StitchAuthRequest.Builder();
    expectedRequestBuilder
      .withMethod(Method.PUT)
      .withPath(
        routes.baseAuthRoute +
          "/api_keys/" +
          keyToEnable.toHexString() +
          "/enable"
      )
      .withRefreshToken()
      .withShouldRefreshOnFailure(false);
    testClientCall(
      (client: CoreUserAPIKeyAuthProviderClient) => {
        return client.enableApiKey(keyToEnable);
      },
      true,
      expectedRequestBuilder.build()
    );
  });

  it("should disable api key", () => {
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const keyToDisable = new ObjectID();
    const expectedRequestBuilder = new StitchAuthRequest.Builder();
    expectedRequestBuilder
      .withMethod(Method.PUT)
      .withPath(
        routes.baseAuthRoute +
          "/api_keys/" +
          keyToDisable.toHexString() +
          "/disable"
      )
      .withRefreshToken()
      .withShouldRefreshOnFailure(false);
    testClientCall(
      client => {
        return client.disableApiKey(keyToDisable);
      },
      true,
      expectedRequestBuilder.build()
    );
  });

  it("should delete api key", () => {
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const keyToDelete = new ObjectID();
    const expectedRequestBuilder = new StitchAuthRequest.Builder();
    expectedRequestBuilder
      .withMethod(Method.DELETE)
      .withPath(routes.baseAuthRoute + "/api_keys/" + keyToDelete.toHexString())
      .withRefreshToken()
      .withShouldRefreshOnFailure(false);
    testClientCall(
      client => {
        return client.deleteApiKey(keyToDelete);
      },
      true,
      expectedRequestBuilder.build()
    );
  });
});
