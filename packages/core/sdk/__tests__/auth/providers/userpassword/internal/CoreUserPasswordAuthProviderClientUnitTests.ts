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

import { anything, capture, instance, mock, verify, when } from "ts-mockito";
import {
  CoreUserPassAuthProviderClient,
  StitchAppRoutes,
  StitchRequestClient
} from "../../../../../src";
import Method from "../../../../../src/internal/net/Method";
import { StitchDocRequest } from "../../../../../src/internal/net/StitchDocRequest";
import { StitchRequest } from "../../../../../src/internal/net/StitchRequest";

describe("CoreUserPasswordAuthProviderClientUnitTests", () => {
  function testClientCall(
    fun: ((CoreUserPasswordAuthProviderClient) => Promise<any>),
    expectedRequest: StitchRequest
  ): Promise<any> {
    const clientAppId = "my_app-12345";
    const providerName = "userPassProvider";

    const requestClientMock = mock(StitchRequestClient);
    const requestClient = instance(requestClientMock);

    const routes = new StitchAppRoutes(clientAppId).authRoutes;
    const client = new CoreUserPassAuthProviderClient(
      providerName,
      requestClient,
      routes
    );

    when(requestClientMock.doRequest(anything())).thenResolve({
      headers: {},
      statusCode: 200
    });
    return fun(client)
      .then(() => {
        verify(requestClientMock.doRequest(anything())).times(1);

        const [requestArg] = capture(requestClientMock.doRequest).last();

        expect(expectedRequest).toEqualRequest(requestArg);

        // Should pass along errors
        when(requestClientMock.doRequest(anything())).thenThrow(
          new Error("whoops")
        );

        return expect(fun(client));
      })
      .catch(err => {
        expect(err).toEqual(new Error("whoops"));
      });
  }

  it("should register", () => {
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const username = "username@10gen.com";
    const password = "password";
    const expectedRequestBuilder = new StitchDocRequest.Builder();
    expectedRequestBuilder
      .withMethod(Method.POST)
      .withPath(
        routes.getAuthProviderExtensionRoute("userPassProvider", "register")
      );
    const expectedDoc = { email: username, password };
    expectedRequestBuilder.withDocument(expectedDoc);

    return testClientCall((client: CoreUserPassAuthProviderClient) =>
      client.registerWithEmailInternal(username, password), expectedRequestBuilder.build());
  });

  it("should confirm user", () => {
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const token = "some";
    const tokenId = "thing";
    const expectedRequestBuilder = new StitchDocRequest.Builder();
    expectedRequestBuilder
      .withMethod(Method.POST)
      .withPath(
        routes.getAuthProviderExtensionRoute("userPassProvider", "confirm")
      );
    const expectedDoc = {
      token,
      tokenId
    };

    expectedRequestBuilder.withDocument(expectedDoc);

    testClientCall(client =>
      client.confirmUserInternal(token, tokenId), expectedRequestBuilder.build());
  });

  it("should resend confirmation", () => {
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const email = "username@10gen.com";
    const expectedRequestBuilder = new StitchDocRequest.Builder();
    expectedRequestBuilder
      .withMethod(Method.POST)
      .withPath(
        routes.getAuthProviderExtensionRoute("userPassProvider", "confirm/send")
      );
    const expectedDoc = { email };
    expectedRequestBuilder.withDocument(expectedDoc);

    testClientCall(client =>
      client.resendConfirmationEmailInternal(email), expectedRequestBuilder.build());
  });
});
