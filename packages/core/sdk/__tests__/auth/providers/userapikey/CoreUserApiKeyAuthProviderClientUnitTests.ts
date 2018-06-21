/**
 * Copyright 2018-present MongoDB, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ObjectID } from "bson";
import { anything, capture, instance, mock, verify, when } from "ts-mockito";
import {
  CoreStitchAuth,
  CoreUserApiKeyAuthProviderClient,
  StitchAppRoutes,
  UserApiKey
} from "../../../../src";
import Method from "../../../../src/internal/net/Method";
import { StitchAuthDocRequest } from "../../../../src/internal/net/StitchAuthDocRequest";
import { StitchAuthRequest } from "../../../../src/internal/net/StitchAuthRequest";
import { StitchRequest } from "../../../../src/internal/net/StitchRequest";
import { RequestClassMatcher } from "../../../ApiTestUtils";

function testClientCall(
  fun: (CoreUserApiKeyAuthProviderClient) => Promise<any>,
  expectedRequest: StitchAuthRequest,
  keyToFetch?: string
): Promise<any> {
  const clientAppId = "my_app-12345";

  const requestClientMock = mock(CoreStitchAuth);
  const requestClient = instance(requestClientMock);

  const routes = new StitchAppRoutes(clientAppId).authRoutes;

  const client = new CoreUserApiKeyAuthProviderClient(requestClient, routes);

  when(
    requestClientMock.doAuthenticatedRequest(new RequestClassMatcher(
      undefined,
      Method.POST
    ) as any)
  ).thenResolve({
    body: JSON.stringify(
      new UserApiKey(new ObjectID().toHexString(), "2", "3", false)
    ),
    headers: {},
    statusCode: 200
  });

  when(
    requestClientMock.doAuthenticatedRequest(new RequestClassMatcher(
      new RegExp(".*/api_keys$"),
      Method.GET
    ) as any)
  ).thenResolve({
    body: JSON.stringify([
      new UserApiKey(new ObjectID().toHexString(), "2", "3", false)
    ]),
    headers: {},
    statusCode: 200
  });

  when(
    requestClientMock.doAuthenticatedRequest(new RequestClassMatcher(
      new RegExp(`.*\/${keyToFetch}$`),
      Method.GET
    ) as any)
  ).thenResolve({
    body: JSON.stringify(
      new UserApiKey(new ObjectID().toHexString(), "2", "3", false)
    ),
    headers: {},
    statusCode: 200
  });

  when(
    requestClientMock.doAuthenticatedRequest(new RequestClassMatcher(
      new RegExp(`.*\/enable$`)
    ) as any)
  ).thenResolve({
    headers: {},
    statusCode: 200
  });

  when(
    requestClientMock.doAuthenticatedRequest(new RequestClassMatcher(
      new RegExp(`.*\/disable$`)
    ) as any)
  ).thenResolve({
    headers: {},
    statusCode: 200
  });

  when(
    requestClientMock.doAuthenticatedRequest(new RequestClassMatcher(
      undefined,
      Method.DELETE
    ) as any)
  ).thenResolve({
    headers: {},
    statusCode: 200
  });

  return fun(client)
    .then(() => {
      verify(requestClientMock.doAuthenticatedRequest(anything())).times(1);

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

    return testClientCall((client: CoreUserApiKeyAuthProviderClient) => {
      return client.createApiKey(apiKeyName);
    }, expectedRequestBuilder.build());
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
      (client: CoreUserApiKeyAuthProviderClient) => {
        return client.fetchApiKey(keyToFetch);
      },
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
    return testClientCall(client => {
      return client.fetchApiKeys();
    }, expectedRequestBuilder.build());
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
    testClientCall((client: CoreUserApiKeyAuthProviderClient) => {
      return client.enableApiKey(keyToEnable);
    }, expectedRequestBuilder.build());
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
    testClientCall(client => {
      return client.disableApiKey(keyToDisable);
    }, expectedRequestBuilder.build());
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
    testClientCall(client => {
      return client.deleteApiKey(keyToDelete);
    }, expectedRequestBuilder.build());
  });
});
