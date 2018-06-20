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
import { sign } from "jsonwebtoken";
import { anything, capture, instance, verify, when } from "ts-mockito";
import {
  getMockedRequestClient,
  RequestClassMatcher,
  TEST_ACCESS_TOKEN,
  TEST_LINK_RESPONE,
  TEST_LOGIN_RESPONSE,
  TEST_REFRESH_TOKEN,
  TEST_USER_PROFILE
} from "../../../__tests__/ApiTestUtils";
import {
  AnonymousAuthProvider,
  AnonymousCredential,
  CoreStitchAuth,
  CoreStitchUser,
  CoreStitchUserImpl,
  DeviceFields,
  MemoryStorage,
  StitchAppRoutes,
  StitchAuthRoutes,
  StitchRequestClient,
  StitchUserFactory,
  StitchUserProfileImpl,
  Storage,
  UserPasswordAuthProvider,
  UserPasswordCredential
} from "../../../src";
import { Decoder } from "../../../src/internal/common/Codec";
import ContentTypes from "../../../src/internal/net/ContentTypes";
import Headers from "../../../src/internal/net/Headers";
import Method from "../../../src/internal/net/Method";
import { StitchAuthDocRequest } from "../../../src/internal/net/StitchAuthDocRequest";
import { StitchDocRequest } from "../../../src/internal/net/StitchDocRequest";
import { StitchRequest } from "../../../src/internal/net/StitchRequest";
import { StitchServiceErrorCode } from "../../../src/StitchServiceErrorCode";
import StitchServiceException from "../../../src/StitchServiceException";

class StitchAuth extends CoreStitchAuth<CoreStitchUserImpl> {
  constructor(
    requestClient: StitchRequestClient,
    authRoutes: StitchAuthRoutes,
    storage: Storage
  ) {
    super(requestClient, authRoutes, storage, false);
  }

  get deviceInfo() {
    const info = {};
    if (this.hasDeviceId) {
      info[DeviceFields.DEVICE_ID] = this.deviceId;
    }
    return info;
  }

  protected get userFactory(): StitchUserFactory<CoreStitchUserImpl> {
    return new class implements StitchUserFactory<CoreStitchUserImpl> {
      public makeUser(
        id: string,
        loggedInProviderType: string,
        loggedInProviderName: string,
        userProfile?: StitchUserProfileImpl
      ): CoreStitchUserImpl {
        return new class extends CoreStitchUserImpl {
          constructor() {
            super(id, loggedInProviderType, loggedInProviderName, userProfile);
          }
        }();
      }
    }();
  }

  protected onAuthEvent() {}
}

describe("CoreStitchAuthUnitTests", () => {
  const appId = "my_app-12345";

  it("should login with credentials", () => {
    const requestClientMock = getMockedRequestClient();
    const requestClient = instance(requestClientMock);
    const routes = new StitchAppRoutes(appId).authRoutes;
    const auth = new StitchAuth(
      requestClient,
      routes,
      new MemoryStorage(appId)
    );

    return auth
      .loginWithCredentialInternal(new AnonymousCredential())
      .then(user => {
        const profile = TEST_USER_PROFILE;
        expect(TEST_LOGIN_RESPONSE.userId).toEqual(user.id);
        expect(AnonymousAuthProvider.DEFAULT_NAME).toEqual(
          user.loggedInProviderName
        );
        expect(AnonymousAuthProvider.TYPE).toEqual(user.loggedInProviderType);
        expect(profile.userType).toEqual(user.userType);
        expect(profile.identities[0].id).toEqual(user.identities[0].id);
        expect(auth.user).toEqual(user);
        expect(auth.isLoggedIn).toBeTruthy();

        verify(requestClientMock.doRequest(anything())).times(2);

        const expectedRequest = new StitchDocRequest.Builder();
        expectedRequest
          .withMethod(Method.POST)
          .withPath(
            routes.getAuthProviderLoginRoute(AnonymousAuthProvider.DEFAULT_NAME)
          );
        expectedRequest.withDocument({ options: { device: {} } });

        const [actualRequest] = capture(
          requestClientMock.doRequest
        ).byCallIndex(0);
        expectedRequest.startedAt = actualRequest.startedAt;
        expect(expectedRequest.build()).toEqualRequest(actualRequest);

        const expectedRequest2 = new StitchRequest.Builder();
        const headers = {
          [Headers.AUTHORIZATION]: Headers.getAuthorizationBearer(
            TEST_ACCESS_TOKEN
          )
        };

        expectedRequest2
          .withMethod(Method.GET)
          .withPath(routes.profileRoute)
          .withHeaders(headers);

        const [actualRequest2] = capture(
          requestClientMock.doRequest
        ).byCallIndex(1);
        expectedRequest2.startedAt = actualRequest2.startedAt;
        expect(expectedRequest2.build()).toEqualRequest(actualRequest2);
      })
      .catch(error => {
        fail(error);
      });
  });

  it("should link user with credentials", () => {
    const requestClientMock = getMockedRequestClient();
    const requestClient = instance(requestClientMock);
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const auth = new StitchAuth(
      requestClient,
      routes,
      new MemoryStorage(appId)
    );

    let testUser: CoreStitchUser;
    return auth
      .loginWithCredentialInternal(new AnonymousCredential())
      .then(user => {
        verify(requestClientMock.doRequest(anything())).times(2);

        testUser = user;
        return auth.linkUserWithCredentialInternal(
          user,
          new UserPasswordCredential("foo@foo.com", "bar")
        );
      })
      .then(linkedUser => {
        expect(testUser.id).toEqual(linkedUser.id);

        verify(requestClientMock.doRequest(anything())).times(4);

        const expectedRequest = new StitchRequest.Builder();
        expectedRequest
          .withMethod(Method.POST)
          .withBody(
            `{\"username\":\"foo@foo.com\",\"password\":\"bar\",\"options\":{\"device\":{\"deviceId\":\"${
              TEST_LOGIN_RESPONSE.deviceId
            }\"}}}`
          )
          .withPath(
            routes.getAuthProviderLinkRoute(
              UserPasswordAuthProvider.DEFAULT_NAME
            )
          );
        const headers = {
          [Headers.CONTENT_TYPE]: ContentTypes.APPLICATION_JSON,
          [Headers.AUTHORIZATION]: Headers.getAuthorizationBearer(
            TEST_ACCESS_TOKEN
          )
        };

        expectedRequest.withHeaders(headers);

        const [reqArg] = capture(requestClientMock.doRequest).byCallIndex(2);

        expect(expectedRequest.build()).toEqualRequest(reqArg);

        const expectedRequest2 = new StitchRequest.Builder();
        const headers2 = {
          [Headers.AUTHORIZATION]: Headers.getAuthorizationBearer(
            TEST_ACCESS_TOKEN
          )
        };

        expectedRequest2
          .withMethod(Method.GET)
          .withPath(routes.profileRoute)
          .withHeaders(headers2);

        const [reqArg2] = capture(requestClientMock.doRequest).byCallIndex(3);
        expectedRequest2.startedAt = reqArg2.startedAt;
        expect(expectedRequest2.build()).toEqualRequest(reqArg2);
      });
  });

  it("should be logged in", () => {
    const requestClientMock = getMockedRequestClient();
    const requestClient = instance(requestClientMock);
    const routes = new StitchAppRoutes(appId).authRoutes;
    const auth = new StitchAuth(
      requestClient,
      routes,
      new MemoryStorage(appId)
    );

    expect(auth.isLoggedIn).toBeFalsy();

    return auth
      .loginWithCredentialInternal(new AnonymousCredential())
      .then(() => {
        expect(auth.isLoggedIn).toBeTruthy();
      });
  });

  it("should logout", () => {
    const requestClientMock = getMockedRequestClient();
    const requestClient = instance(requestClientMock);
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const auth = new StitchAuth(
      requestClient,
      routes,
      new MemoryStorage(appId)
    );

    expect(auth.isLoggedIn).toBeFalsy();

    return auth
      .loginWithCredentialInternal(new AnonymousCredential())
      .then(() => {
        expect(auth.isLoggedIn).toBeTruthy();

        return auth.logoutInternal();
      })
      .then(() => {
        verify(requestClientMock.doRequest(anything())).times(3);

        const expectedRequest = new StitchRequest.Builder();
        expectedRequest.withMethod(Method.DELETE).withPath(routes.sessionRoute);
        const headers = {
          [Headers.AUTHORIZATION]: Headers.getAuthorizationBearer(
            TEST_REFRESH_TOKEN
          )
        };
        expectedRequest.withHeaders(headers);

        const [actualRequest] = capture(
          requestClientMock.doRequest
        ).byCallIndex(2);
        expect(expectedRequest.build()).toEqualRequest(actualRequest);

        expect(auth.isLoggedIn).toBeFalsy();
      });
  });

  it("should have device id", () => {
    const requestClientMock = getMockedRequestClient();
    const requestClient = instance(requestClientMock);
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const auth = new StitchAuth(
      requestClient,
      routes,
      new MemoryStorage(appId)
    );

    expect(auth.hasDeviceId).toBeFalsy();

    return auth
      .loginWithCredentialInternal(new AnonymousCredential())
      .then(() => {
        expect(auth.hasDeviceId).toBeTruthy();
      });
  });

  it("should handle auth failure", async () => {
    const requestClientMock = getMockedRequestClient();
    const requestClient = instance(requestClientMock);
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const auth = new StitchAuth(
      requestClient,
      routes,
      new MemoryStorage(appId)
    );

    const jwtDoc = {
      iat: new Date().getMilliseconds() - 5 * 60 * 1000,
      sub: "uniqueUserID",
      test_refreshed: true,
      typ: "access"
    };

    const refreshedJwt = sign(jwtDoc, "abcdefghijklmnopqrstuvwxyz1234567890");

    const user = await auth.loginWithCredentialInternal(new AnonymousCredential());
    when(
      requestClientMock.doRequest(new RequestClassMatcher(
        new RegExp(".*/session$")
      ) as any)
    ).thenResolve({
      body: JSON.stringify({ access_token: refreshedJwt }),
      headers: {},
      statusCode: 200
    });

    let hasBeenCalled = false;
    when(
      requestClientMock.doRequest(new RequestClassMatcher(
        new RegExp(".*/login\\?link=true$")
      ) as any)
    ).thenReject(new StitchServiceException(
      "bad",
      StitchServiceErrorCode.InvalidSession
    )).thenResolve({
      body: JSON.stringify(TEST_LINK_RESPONE),
      headers: {},
      statusCode: 200
    });

    const linkedUser = await auth.linkUserWithCredentialInternal(
      user,
      new UserPasswordCredential("foo@foo.com", "bar")
    )

    verify(requestClientMock.doRequest(anything())).times(6);

    const expectedRequest = new StitchRequest.Builder();
    expectedRequest.withMethod(Method.POST).withPath(routes.sessionRoute);
    const headers = {
      [Headers.AUTHORIZATION]: Headers.getAuthorizationBearer(
        TEST_REFRESH_TOKEN
      )
    };

    expectedRequest.withHeaders(headers);

    const [actualRequest] = capture(
      requestClientMock.doRequest
    ).byCallIndex(3);
    expect(expectedRequest.build()).toEqualRequest(actualRequest);

    const expectedRequest2 = new StitchRequest.Builder();
    expectedRequest2
      .withMethod(Method.POST)
      .withBody(
        `{\"username\":\"foo@foo.com\",\"password\":\"bar\",\"options\":{\"device\":{\"deviceId\":\"${
          TEST_LOGIN_RESPONSE.deviceId
        }\"}}}`
      )
      .withPath(
        routes.getAuthProviderLinkRoute(
          UserPasswordAuthProvider.DEFAULT_NAME
        )
      );
    const headers2 = {
      [Headers.CONTENT_TYPE]: ContentTypes.APPLICATION_JSON,
      [Headers.AUTHORIZATION]: Headers.getAuthorizationBearer(refreshedJwt)
    };
    expectedRequest2.withHeaders(headers2);

    const [actualRequest2] = capture(
      requestClientMock.doRequest
    ).byCallIndex(4);
    expect(expectedRequest2.build()).toEqualRequest(actualRequest2);

    expect(auth.isLoggedIn).toBeTruthy();

    // This should log the user out
    when(
      requestClientMock.doRequest(new RequestClassMatcher(
        new RegExp(".*/session$")
      ) as any)
    ).thenReject(
      new StitchServiceException(
        "beep",
        StitchServiceErrorCode.InvalidSession
      )
    );

    when(
      requestClientMock.doRequest(new RequestClassMatcher(
        new RegExp(".*/login\\?link=true$")
      ) as any)
    ).thenReject(
      new StitchServiceException(
        "boop",
        StitchServiceErrorCode.InvalidSession
      )
    );

    try {
      await auth.linkUserWithCredentialInternal(
        linkedUser,
        new UserPasswordCredential("foo@foo.com", "bar")
      );
    } catch (e) {
      expect(e).toEqual(
        new StitchServiceException(
          "beep",
          StitchServiceErrorCode.InvalidSession
        )
      );

      expect(auth.isLoggedIn).toBeFalsy();
    }
  });

  it("should do authenticated json request", () => {
    const requestClientMock = getMockedRequestClient();
    const requestClient = instance(requestClientMock);
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const auth = new StitchAuth(
      requestClient,
      routes,
      new MemoryStorage(appId)
    );

    const expectedObjectId = new ObjectID();
    const docRaw = `{\"_id\": {\"$oid\": \"${expectedObjectId.toHexString()}\"}, \"intValue\": {\"$numberInt\": \"42\"}}`;

    const reqBuilder = new StitchAuthDocRequest.Builder();
    reqBuilder.withPath("giveMeData");
    reqBuilder.withDocument({});
    reqBuilder.withMethod(Method.POST);

    return auth
      .loginWithCredentialInternal(new AnonymousCredential())
      .then(() => {
        const rawInt = '{"$numberInt": "42"}';
        // Check that primitive return types can be decoded.
        when(requestClientMock.doRequest(anything())).thenResolve({
          body: rawInt,
          headers: {},
          statusCode: 200
        });

        return auth.doAuthenticatedRequestWithDecoder(reqBuilder.build());
      })
      .then((res: number) => {
        expect(res).toEqual(42);
        // Check that BSON documents returned as extended JSON can be decoded.
        when(requestClientMock.doRequest(anything())).thenResolve({
          body: docRaw,
          headers: {},
          statusCode: 200
        });

        return auth.doAuthenticatedRequestWithDecoder(reqBuilder.build());
      })
      .then((res: { [key: string]: string }) => {
        expect(expectedObjectId).toEqual(res["_id"]);
        expect(res["intValue"]).toEqual(42);

        // Check that BSON documents returned as extended JSON can be
        // decoded into custom types
        when(requestClientMock.doRequest(anything())).thenResolve({
          body: docRaw,
          headers: {},
          statusCode: 200
        });

        interface TestDoc {
          id: ObjectID;
          intValue: number;
        }

        return auth.doAuthenticatedRequestWithDecoder(
          reqBuilder.build(),
          new class implements Decoder<TestDoc> {
            public decode(from: object): TestDoc {
              return {
                id: from["_id"],
                intValue: from["intValue"]
              };
            }
          }()
        );
      })
      .then(res => {
        expect(res.id).toEqual(expectedObjectId);
        expect(res.intValue).toEqual(42);
      });
  });
});
