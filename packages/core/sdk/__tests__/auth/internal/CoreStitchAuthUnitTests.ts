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

import BSON from "bson";
import { sign } from "jsonwebtoken";
import { anything, capture, instance, verify, mock, when } from "ts-mockito";
import {
  getMockedRequestClient,
  RequestClassMatcher,
  TEST_ACCESS_TOKEN,
  TEST_LINK_RESPONE,
  TEST_LOGIN_RESPONSE,
  TEST_REFRESH_TOKEN,
  TEST_USER_PROFILE,
  getLastLoginUserId,
  mockNextUserResponse
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
  UserPasswordCredential,
  StitchClientError,
  StitchClientErrorCode
} from "../../../src";
import { Decoder } from "../../../src/internal/common/Codec";
import ContentTypes from "../../../src/internal/net/ContentTypes";
import Headers from "../../../src/internal/net/Headers";
import Method from "../../../src/internal/net/Method";
import { StitchAuthDocRequest } from "../../../src/internal/net/StitchAuthDocRequest";
import { StitchDocRequest } from "../../../src/internal/net/StitchDocRequest";
import { StitchRequest } from "../../../src/internal/net/StitchRequest";
import StitchServiceError from "../../../src/StitchServiceError";
import { StitchServiceErrorCode } from "../../../src/StitchServiceErrorCode";
import StitchRequestError from "../../../src/StitchRequestError";
import { StitchRequestErrorCode } from "../../../src/StitchRequestErrorCode";

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
        isLoggedIn: boolean,
        userProfile?: StitchUserProfileImpl
      ): CoreStitchUserImpl {
        return new class extends CoreStitchUserImpl {
          constructor() {
            super(id, loggedInProviderType, loggedInProviderName, isLoggedIn, userProfile);
          }
        }();
      }
    }();
  }

  protected onAuthEvent() {}

  protected dispatchAuthEvent() {}
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
        expect(getLastLoginUserId()).toEqual(user.id);
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

  it("should logout", async () => {
    const requestClientMock = getMockedRequestClient();
    const requestClient = instance(requestClientMock);
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const storage = new MemoryStorage(appId);
    const auth = new StitchAuth(
      requestClient,
      routes,
      storage
    );

    try {
      await auth.logoutUserWithIdInternal("not_a_user_id");
      fail("expected to fail because user does not exist");
    } catch (e) {
      expect(e).toBeInstanceOf(StitchClientError);
      const sce = e as StitchClientError;
      expect(sce.errorCode).toEqual(
        StitchClientErrorCode.UserNotFound
      );
    }

    expect(auth.isLoggedIn).toBeFalsy();
    mockNextUserResponse(requestClientMock);
    const user1 = await auth.loginWithCredentialInternal(
      new AnonymousCredential()
    );

    mockNextUserResponse(requestClientMock);
    const user2 = await auth.loginWithCredentialInternal(
      new UserPasswordCredential("hi", "there")
    );

    mockNextUserResponse(requestClientMock);
    const user3 = await auth.loginWithCredentialInternal(
      new UserPasswordCredential("bye", "there")
    );

    expect(auth.listUsers()[2]).toEqual(user3);
    expect(auth.user).toEqual(user3);
    expect(auth.isLoggedIn).toBeTruthy();

    await auth.logoutInternal();

    expect(auth.isLoggedIn).toBeFalsy();

    // assert that though one user is logged out, three users are still listed,
    // and their profiles are all non-null
    expect(auth.listUsers().length).toEqual(3);
    auth.listUsers().forEach(user => {
      expect(user.profile).toBeDefined()
    });

    verify(requestClientMock.doRequest(anything())).times(7);

    const expectedRequest = new StitchRequest.Builder();
    expectedRequest.withMethod(Method.DELETE).withPath(routes.sessionRoute);
    const headers = {
      [Headers.AUTHORIZATION]: Headers.getAuthorizationBearer(
        TEST_REFRESH_TOKEN
      )
    };
    expectedRequest.withHeaders(headers);

    let [actualRequest] = capture(
      requestClientMock.doRequest
    ).byCallIndex(6);
    expect(expectedRequest.build()).toEqualRequest(actualRequest);

    expect(auth.isLoggedIn).toBeFalsy();

    auth.switchToUserWithId(user2.id);
    await auth.logoutInternal();

    verify(requestClientMock.doRequest(anything())).times(8);

    [actualRequest] = capture(
      requestClientMock.doRequest
    ).byCallIndex(7);
    expect(expectedRequest.build()).toEqualRequest(actualRequest);

    expect(auth.listUsers().length).toEqual(3);

    // log out the last user without switching to them
    await auth.logoutUserWithIdInternal(user1.id);

    // assert that this leaves only two users since logging out an anonymous
    // user deletes that user, and assert they are all logged out
    expect(auth.listUsers().length).toEqual(2);

    auth.listUsers().forEach(user => {
      expect(user.isLoggedIn).toBeFalsy();
    });

    expect(auth.isLoggedIn).toBeFalsy();

    // assert that we still have a device ID 
    expect(auth.hasDeviceId).toBeTruthy();

    // assert that logging back into a non-anon user after logging out works
    mockNextUserResponse(requestClientMock, user2.id);

    expect(await auth.loginWithCredentialInternal(
      new UserPasswordCredential("hi", "there")
    )).toEqual(user2);

    expect(auth.isLoggedIn).toBeTruthy();
  });

  it("should remove users", async () => {
    const requestClientMock = getMockedRequestClient();
    const requestClient = instance(requestClientMock);
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const storage = new MemoryStorage(appId);
    const auth = new StitchAuth(
      requestClient,
      routes,
      storage
    );

    expect(auth.isLoggedIn).toBeFalsy();

    mockNextUserResponse(requestClientMock);
    const user1 = await auth.loginWithCredentialInternal(
      new AnonymousCredential()
    );

    mockNextUserResponse(requestClientMock);
    const user2 = await auth.loginWithCredentialInternal(
      new UserPasswordCredential("hi", "there")
    );

    mockNextUserResponse(requestClientMock);
    const user3 = await auth.loginWithCredentialInternal(
      new UserPasswordCredential("bye", "there")
    );

    expect(auth.listUsers()[2]).toEqual(user3);
    expect(auth.isLoggedIn).toBeTruthy();

    await auth.removeUserInternal();

    // assert that though one user was removed and we are logged out, 
    // two users are still listed.
    expect(auth.isLoggedIn).toBeFalsy();
    expect(auth.listUsers().length).toEqual(2);

    verify(requestClientMock.doRequest(anything())).times(7);

    const expectedRequest = new StitchRequest.Builder();
    expectedRequest.withMethod(Method.DELETE).withPath(routes.sessionRoute);
    const headers = {
      [Headers.AUTHORIZATION]: Headers.getAuthorizationBearer(
        TEST_REFRESH_TOKEN
      )
    };
    expectedRequest.withHeaders(headers);

    let [actualRequest] = capture(
      requestClientMock.doRequest
    ).byCallIndex(6);
    expect(expectedRequest.build()).toEqualRequest(actualRequest);

    expect(auth.isLoggedIn).toBeFalsy();

    // assert that switching to a user, and removing self works
    auth.switchToUserWithId(user2.id);
    expect(auth.isLoggedIn).toBeTruthy();

    await auth.removeUserInternal();

    verify(requestClientMock.doRequest(anything())).times(8);

    [actualRequest] = capture(
      requestClientMock.doRequest
    ).byCallIndex(7);
    expect(expectedRequest.build()).toEqualRequest(actualRequest);

    // assert that there is one user left
    expect(auth.listUsers().length).toEqual(1);
    expect(auth.listUsers()[0]).toEqual(user1);

    // assert that we can remove the user without switching to it
    await auth.removeUserWithIdInternal(user1.id);
    expect(auth.listUsers().length).toEqual(0);
    expect(auth.isLoggedIn).toBeFalsy();

    // assert that we can log back into the user that we removed
    mockNextUserResponse(requestClientMock, user2.id);
    expect(await auth.loginWithCredentialInternal(
      new UserPasswordCredential("hi", "there")
    )).toEqual(user2);

    expect(auth.listUsers().length).toEqual(1);
    expect(auth.listUsers()[0]).toEqual(user2);

    expect(auth.isLoggedIn).toBeTruthy();
  });

  it("should be able to switch users", async () => {
    const requestClientMock = getMockedRequestClient();
    const requestClient = instance(requestClientMock);
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const storage = new MemoryStorage(appId);
    const auth = new StitchAuth(
      requestClient,
      routes,
      storage
    );

    try {
      auth.switchToUserWithId("not_a_user_id");
      fail("expected to fail because user does not exist");
    } catch (e) {
      expect(e).toBeInstanceOf(StitchClientError);
      const sce = e as StitchClientError;
      expect(sce.errorCode).toEqual(
        StitchClientErrorCode.UserNotFound
      );
    }

    expect(auth.isLoggedIn).toBeFalsy();
    mockNextUserResponse(requestClientMock);
    const user = await auth.loginWithCredentialInternal(
      new UserPasswordCredential("hello", "there")
    );

    // can switch to self
    expect(auth.switchToUserWithId(user.id)).toEqual(user);
    expect(auth.user).toEqual(user);

    mockNextUserResponse(requestClientMock);
    const user2 = await auth.loginWithCredentialInternal(
      new UserPasswordCredential("hi", "there")
    );

    expect(auth.user).toEqual(user2);
    expect(auth.user).not.toEqual(user);

    // can switch back to old user 
    expect(auth.switchToUserWithId(user.id)).toEqual(user);
    expect(auth.user).toEqual(user);

    // switch back to second user after logging out
    await auth.logoutInternal();
    expect(auth.listUsers().length).toEqual(2);
    expect(auth.switchToUserWithId(user2.id)).toEqual(user2);

    // assert that we can't switch to logged out user
    try {
      auth.switchToUserWithId(user.id);
      fail("expected to fail because we can't switch to logged out user");
    } catch (e) {
      expect(e).toBeInstanceOf(StitchClientError);
      const sce = e as StitchClientError;
      expect(sce.errorCode).toEqual(
        StitchClientErrorCode.UserNotLoggedIn
      );
    }
  });

  it("should be able to list users", async () => {
    const requestClientMock = getMockedRequestClient();
    const requestClient = instance(requestClientMock);
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const storage = new MemoryStorage(appId);
    const auth = new StitchAuth(
      requestClient,
      routes,
      storage
    );

    mockNextUserResponse(requestClientMock);
    const user = await auth.loginWithCredentialInternal(
      new UserPasswordCredential("hello", "there")
    );

    expect(auth.listUsers().length).toEqual(1);
    expect(auth.listUsers()[0]).toEqual(user);

    mockNextUserResponse(requestClientMock);
    const user2 = await auth.loginWithCredentialInternal(
      new UserPasswordCredential("bye", "there")
    );

    expect(auth.listUsers().length).toEqual(2);
    expect(auth.listUsers()[0]).toEqual(user);
    expect(auth.listUsers()[1]).toEqual(user2);
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

    const user = await auth.loginWithCredentialInternal(
      new AnonymousCredential()
    );
    when(
      requestClientMock.doRequest(new RequestClassMatcher(
        new RegExp(".*/session$")
      ) as any)
    ).thenResolve({
      body: JSON.stringify({ access_token: refreshedJwt }),
      headers: {},
      statusCode: 200
    });

    when(
      requestClientMock.doRequest(new RequestClassMatcher(
        new RegExp(".*/login\\?link=true$")
      ) as any)
    )
      .thenReject(
        new StitchServiceError("bad", StitchServiceErrorCode.InvalidSession)
      )
      .thenResolve({
        body: JSON.stringify(TEST_LINK_RESPONE),
        headers: {},
        statusCode: 200
      });

    const linkedUser = await auth.linkUserWithCredentialInternal(
      user,
      new UserPasswordCredential("foo@foo.com", "bar")
    );

    verify(requestClientMock.doRequest(anything())).times(6);

    const expectedRequest = new StitchRequest.Builder();
    expectedRequest.withMethod(Method.POST).withPath(routes.sessionRoute);
    const headers = {
      [Headers.AUTHORIZATION]: Headers.getAuthorizationBearer(
        TEST_REFRESH_TOKEN
      )
    };

    expectedRequest.withHeaders(headers);

    const [actualRequest] = capture(requestClientMock.doRequest).byCallIndex(3);
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
        routes.getAuthProviderLinkRoute(UserPasswordAuthProvider.DEFAULT_NAME)
      );
    const headers2 = {
      [Headers.CONTENT_TYPE]: ContentTypes.APPLICATION_JSON,
      [Headers.AUTHORIZATION]: Headers.getAuthorizationBearer(refreshedJwt)
    };
    expectedRequest2.withHeaders(headers2);

    const [actualRequest2] = capture(requestClientMock.doRequest).byCallIndex(
      4
    );
    expect(expectedRequest2.build()).toEqualRequest(actualRequest2);

    expect(auth.isLoggedIn).toBeTruthy();

    // This should log the user out
    when(
      requestClientMock.doRequest(new RequestClassMatcher(
        new RegExp(".*/session$")
      ) as any)
    ).thenReject(
      new StitchServiceError("beep", StitchServiceErrorCode.InvalidSession)
    );

    when(
      requestClientMock.doRequest(new RequestClassMatcher(
        new RegExp(".*/login\\?link=true$")
      ) as any)
    ).thenReject(
      new StitchServiceError("boop", StitchServiceErrorCode.InvalidSession)
    );

    try {
      await auth.linkUserWithCredentialInternal(
        linkedUser,
        new UserPasswordCredential("foo@foo.com", "bar")
      );
    } catch (e) {
      expect(e).toEqual(
        new StitchServiceError("beep", StitchServiceErrorCode.InvalidSession)
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

    const expectedObjectId = new BSON.ObjectID();
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
            public decode(from: any): TestDoc {
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

  it("should properly handle profile request failure", async () => {
    const requestClientMock = mock(StitchRequestClient);

    // Any /login works
    when(
      requestClientMock.doRequest(new RequestClassMatcher(
        new RegExp(".*/login")
      ) as any)
    ).thenResolve({
      body: JSON.stringify(TEST_LOGIN_RESPONSE),
      headers: {},
      statusCode: 200
    });
  
    // Any /session works
    when(
      requestClientMock.doRequest(new RequestClassMatcher(
        new RegExp(".*/session")
      ) as any)
    ).thenResolve({
      body: JSON.stringify(TEST_LOGIN_RESPONSE),
      headers: {},
      statusCode: 200
    });
  
    // Profile works when we want it to for the purposes of the tests
    const testProfileResponse = {
      body: JSON.stringify(TEST_USER_PROFILE),
      headers: {},
      statusCode: 200
    };

    const testProfileRequestError = new StitchRequestError(
      new Error("profile request failed"), 
      StitchRequestErrorCode.TRANSPORT_ERROR
    );

    when(
      requestClientMock.doRequest(new RequestClassMatcher(
        new RegExp(".*/profile")
      ) as any)
    ).thenReject(testProfileRequestError) // first login attempt (scenario 1)
      .thenResolve(testProfileResponse) // successful login (scenario 2)
      .thenReject(testProfileRequestError) // failure to login as another user (scenario 2)
      .thenResolve(testProfileResponse) // successful login (scenario 3)
      .thenReject(testProfileRequestError); // failure to link to other identity (scenario 3)
  
    // Any link works
    when(
      requestClientMock.doRequest(new RequestClassMatcher(
        new RegExp(".*/login?link=true")
      ) as any)
    ).thenResolve({
      body: JSON.stringify(TEST_USER_PROFILE),
      headers: {},
      statusCode: 200
    });
    const requestClient = instance(requestClientMock);
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const auth = new StitchAuth(
      requestClient,
      routes,
      new MemoryStorage(appId)
    );

    const testProfileRequestMatcher = 
      new RequestClassMatcher(new RegExp(".*/profile")) as any;

    // Scenario 1: User is logged out -> attempts login -> initial login succeeds
    //                                -> profile request fails -> user is logged out

    try {
      await auth.loginWithCredentialInternal(new AnonymousCredential());
      fail("expected login to fail because of profile request");
    } catch (e) {
      // do nothing, this was expected
    }

    expect(auth.isLoggedIn).toBeFalsy();
    expect(auth.user).toBeUndefined();

    // Scenario 2: User is logged in -> attempts login into other account -> initial login succeeds
    //                               -> profile request fails -> original user is still logged in

    const user = await auth.loginWithCredentialInternal(new AnonymousCredential());

    expect(user).toBeDefined();

    try {
      await auth.loginWithCredentialInternal(
        new UserPasswordCredential("foo", "bar")
      );
      fail("expected login to fail because of profile request");
    } catch {
      // do nothing, this was expected
    }

    // the original user should be logged in
    expect(auth.isLoggedIn).toBeTruthy();
    expect(auth.user).toEqual(user);

    // logout so the next test doesn't reuse this session
    await auth.logoutInternal();

    // Scenario 3: User is logged in -> attempt to link to other identity
    //                               -> initial link request succeeds
    //                               -> profile request fails -> error thrown
    //                               -> original user is still logged in

    const userToBeLinked = 
      await auth.loginWithCredentialInternal(new AnonymousCredential());

    expect(userToBeLinked).toBeDefined();

    try {
      await auth.linkUserWithCredentialInternal(
        userToBeLinked, new UserPasswordCredential("foo", "bar")
      );
      fail("expected link to fail because of profile request");
    } catch {
      // do nothing, this was expected
    }

    expect(auth.isLoggedIn).toBeTruthy();
    expect(auth.user.id).toEqual(userToBeLinked.id);
  });
});
