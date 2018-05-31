import {
  AnonymousCredential,
  AnonymousAuthProvider,
  StitchAuthRoutes,
  UserPasswordAuthProvider,
  DeviceFields,
  CoreStitchAuth,
  CoreStitchUserImpl,
  StitchRequestClient,
  Storage,
  StitchUserFactory,
  StitchUserProfileImpl,
  StitchAppRoutes,
  MemoryStorage,
  CoreStitchUser,
  UserPasswordCredential
} from "../../../lib";
import {
  getMockedRequestClient,
  getAuthorizationBearer,
  TEST_ACCESS_TOKEN,
  TEST_USER_PROFILE,
  TEST_LOGIN_RESPONSE,
  TEST_REFRESH_TOKEN,
  RequestClassMatcher,
  TEST_LINK_RESPONE
} from "../../../__tests__/APITestUtils";
import { verify, anything, capture, instance, when } from "ts-mockito";
import { sign } from "jsonwebtoken";
import { StitchDocRequest } from "../../../lib/internal/net/StitchDocRequest";
import Method from "../../../lib/internal/net/Method";
import { StitchRequest } from "../../../lib/internal/net/StitchRequest";
import Headers from "../../../lib/internal/net/Headers";
import ContentTypes from "../../../lib/internal/net/ContentTypes";
import StitchServiceException from "../../../lib/StitchServiceException";
import { StitchServiceErrorCode } from "../../../lib/StitchServiceErrorCode";

class StitchAuth extends CoreStitchAuth<CoreStitchUserImpl> {
  constructor(
    requestClient: StitchRequestClient,
    authRoutes: StitchAuthRoutes,
    storage: Storage
  ) {
    super(requestClient, authRoutes, storage);
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
      makeUser(
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
  it("should login with credentials", () => {
    const requestClientMock = getMockedRequestClient();
    const requestClient = instance(requestClientMock);
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const auth = new StitchAuth(requestClient, routes, new MemoryStorage());

    return auth
      .loginWithCredential(new AnonymousCredential())
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
          [Headers.AUTHORIZATION]: getAuthorizationBearer(TEST_ACCESS_TOKEN)
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
        console.log(error);
        fail(error);
      });
  });

  it("should link user with credentials", () => {
    const requestClientMock = getMockedRequestClient();
    const requestClient = instance(requestClientMock);
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const auth = new StitchAuth(requestClient, routes, new MemoryStorage());

    var testUser: CoreStitchUser;
    return auth
      .loginWithCredential(new AnonymousCredential())
      .then(user => {
        verify(requestClientMock.doRequest(anything())).times(2);

        testUser = user;
        return auth.linkUserWithCredential(
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
          [Headers.AUTHORIZATION]: getAuthorizationBearer(TEST_ACCESS_TOKEN)
        };

        expectedRequest.withHeaders(headers);

        const [reqArg] = capture(requestClientMock.doRequest).byCallIndex(2);

        expect(expectedRequest.build()).toEqualRequest(reqArg);

        const expectedRequest2 = new StitchRequest.Builder();
        const headers2 = {
          [Headers.AUTHORIZATION]: getAuthorizationBearer(TEST_ACCESS_TOKEN)
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
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const auth = new StitchAuth(requestClient, routes, new MemoryStorage());

    expect(auth.isLoggedIn).toBeFalsy;

    return auth.loginWithCredential(new AnonymousCredential()).then(() => {
      expect(auth.isLoggedIn).toBeTruthy();
    });
  });

  it("should logout", () => {
    const requestClientMock = getMockedRequestClient();
    const requestClient = instance(requestClientMock);
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const auth = new StitchAuth(requestClient, routes, new MemoryStorage());

    expect(auth.isLoggedIn).toBeFalsy();

    return auth
      .loginWithCredential(new AnonymousCredential())
      .then(() => {
        expect(auth.isLoggedIn).toBeTruthy();

        return auth.logout();
      })
      .then(() => {
        verify(requestClientMock.doRequest(anything())).times(3);

        const expectedRequest = new StitchRequest.Builder();
        expectedRequest.withMethod(Method.DELETE).withPath(routes.sessionRoute);
        const headers = {
          [Headers.AUTHORIZATION]: getAuthorizationBearer(TEST_REFRESH_TOKEN)
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
    const auth = new StitchAuth(requestClient, routes, new MemoryStorage());

    expect(auth.hasDeviceId).toBeFalsy();

    return auth.loginWithCredential(new AnonymousCredential()).then(() => {
      expect(auth.hasDeviceId).toBeTruthy();
    });
  });

  it("should handle auth failure", () => {
    const requestClientMock = getMockedRequestClient();
    const requestClient = instance(requestClientMock);
    const routes = new StitchAppRoutes("my_app-12345").authRoutes;
    const auth = new StitchAuth(requestClient, routes, new MemoryStorage());

    const jwtDoc = {
      typ: "access",
      test_refreshed: true,
      iat: new Date().getMilliseconds() - 5 * 60 * 1000,
      sub: "uniqueUserID"
    };

    const refreshedJwt = sign(jwtDoc, "abcdefghijklmnopqrstuvwxyz1234567890");

    return auth
      .loginWithCredential(new AnonymousCredential())
      .then(user => {
        when(
          requestClientMock.doRequest(<any>new RequestClassMatcher(
            new RegExp(".*/session$")
          ))
        ).thenResolve({
          statusCode: 200,
          headers: {},
          body: JSON.stringify({ access_token: refreshedJwt })
        });

        var hasBeenCalled = false;
        when(
          requestClientMock.doRequest(<any>new RequestClassMatcher(
            new RegExp(".*/login\\?link=true$")
          ))
        ).thenCall(() => {
          if (hasBeenCalled) {
            return Promise.resolve({
              statusCode: 200,
              headers: {},
              body: JSON.stringify(TEST_LINK_RESPONE)
            });
          } else {
            hasBeenCalled = true;
            return Promise.reject(
              new StitchServiceException(
                "bad",
                StitchServiceErrorCode.InvalidSession
              )
            );
          }
        });

        return auth.linkUserWithCredential(
          user,
          new UserPasswordCredential("foo@foo.com", "bar")
        );
      })
      .then(linkedUser => {
        verify(requestClientMock.doRequest(anything())).times(6);

        const expectedRequest = new StitchRequest.Builder();
        expectedRequest.withMethod(Method.POST).withPath(routes.sessionRoute);
        const headers = {
          [Headers.AUTHORIZATION]: getAuthorizationBearer(TEST_REFRESH_TOKEN)
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
          [Headers.AUTHORIZATION]: getAuthorizationBearer(refreshedJwt)
        };
        expectedRequest2.withHeaders(headers2);

        const [actualRequest2] = capture(
          requestClientMock.doRequest
        ).byCallIndex(4);
        expect(expectedRequest2.build()).toEqualRequest(actualRequest2);

        expect(auth.isLoggedIn).toBeTruthy();

        // This should log the user out
        when(
          requestClientMock.doRequest(<any>new RequestClassMatcher(
            new RegExp(".*/session$")
          ))
        ).thenReject(
          new StitchServiceException(
            "beep",
            StitchServiceErrorCode.InvalidSession
          )
        );

        when(
          requestClientMock.doRequest(<any>new RequestClassMatcher(
            new RegExp(".*/login\\?link=true$")
          ))
        ).thenReject(
          new StitchServiceException(
            "boop",
            StitchServiceErrorCode.InvalidSession
          )
        );

        return auth.linkUserWithCredential(
          linkedUser,
          new UserPasswordCredential("foo@foo.com", "bar")
        );
      })
      .catch(error => {
        expect(error).toEqual(
          new StitchServiceException(
            "beep",
            StitchServiceErrorCode.InvalidSession
          )
        );

        expect(auth.isLoggedIn).toBeFalsy();
      });
  });

  //   @Test
  //   public void testDoAuthenticatedJsonRequestWithDefaultCodecRegistry() {
  //     final StitchRequestClient requestClient = getMockedRequestClient();
  //     final StitchAuthRoutes routes = new StitchAppRoutes("my_app-12345").getAuthRoutes();
  //     final StitchAuth auth = new StitchAuth(
  //         requestClient,
  //         routes,
  //         new MemoryStorage());
  //     auth.loginWithCredentialInternal(new AnonymousCredential());

  //     final StitchAuthDocRequest.Builder reqBuilder = new StitchAuthDocRequest.Builder();
  //     reqBuilder.withPath("giveMeData");
  //     reqBuilder.withDocument(new Document());
  //     reqBuilder.withMethod(Method.POST);

  //     final String rawInt = "{\"$numberInt\": \"42\"}";
  //     // Check that primitive return types can be decoded.
  //     doReturn(new Response(rawInt)).when(requestClient).doRequest(any());
  //     assertEquals(42, (int) auth.doAuthenticatedJsonRequest(
  //         reqBuilder.build(),
  //         Integer.class, BsonUtils.DEFAULT_CODEC_REGISTRY));
  //     doReturn(new Response(rawInt)).when(requestClient).doRequest(any());
  //     assertEquals(42, (int) auth.doAuthenticatedJsonRequest(
  //         reqBuilder.build(),
  //         new IntegerCodec()));

  //     // Check that the proper exceptions are thrown when decoding into the incorrect type.
  //     doReturn(new Response(rawInt)).when(requestClient).doRequest(any());
  //     try {
  //       auth.doAuthenticatedJsonRequest(
  //           reqBuilder.build(),
  //           String.class,
  //           BsonUtils.DEFAULT_CODEC_REGISTRY);
  //       fail();
  //     } catch (final StitchRequestException ignored) {
  //       // do nothing
  //     }

  //     doReturn(new Response(rawInt)).when(requestClient).doRequest(any());
  //     try {
  //       auth.doAuthenticatedJsonRequest(reqBuilder.build(), new StringCodec());
  //       fail();
  //     } catch (final StitchRequestException ignored) {
  //       // do nothing
  //     }

  //     // Check that BSON documents returned as extended JSON can be decoded.
  //     final ObjectId expectedObjectId = new ObjectId();
  //     final String docRaw =
  //         String.format(
  //             "{\"_id\": {\"$oid\": \"%s\"}, \"intValue\": {\"$numberInt\": \"42\"}}",
  //             expectedObjectId.toHexString());
  //     doReturn(new Response(docRaw)).when(requestClient).doRequest(any());

  //     Document doc = auth.doAuthenticatedJsonRequest(
  //         reqBuilder.build(),
  //         Document.class,
  //         BsonUtils.DEFAULT_CODEC_REGISTRY);
  //     assertEquals(expectedObjectId, doc.getObjectId("_id"));
  //     assertEquals(42, (int) doc.getInteger("intValue"));

  //     doReturn(new Response(docRaw)).when(requestClient).doRequest(any());
  //     doc = auth.doAuthenticatedJsonRequest(reqBuilder.build(), new DocumentCodec());
  //     assertEquals(expectedObjectId, doc.getObjectId("_id"));
  //     assertEquals(42, (int) doc.getInteger("intValue"));

  //     // Check that BSON documents returned as extended JSON can be decoded as a custom type if
  //     // the codec is specifically provided.
  //     doReturn(new Response(docRaw)).when(requestClient).doRequest(any());
  //     final CustomType ct =
  //         auth.doAuthenticatedJsonRequest(reqBuilder.build(), new CustomType.Codec());
  //     assertEquals(expectedObjectId, ct.getId());
  //     assertEquals(42, ct.getIntValue());

  //     // Check that the correct exception is thrown if attempting to decode as a particular class
  //     // type if the auth was never configured to contain the provided class type
  //     // codec.
  //     doReturn(new Response(docRaw)).when(requestClient).doRequest(any());
  //     try {
  //       auth.doAuthenticatedJsonRequest(
  //           reqBuilder.build(),
  //           CustomType.class,
  //           BsonUtils.DEFAULT_CODEC_REGISTRY);
  //       fail();
  //     } catch (final StitchRequestException ignored) {
  //       // do nothing
  //     }

  //     // Check that BSON arrays can be decoded
  //     final List<Object> arrFromServer =
  //         Arrays.asList(21, "the meaning of life, the universe, and everything", 84, 168);
  //     final String arrFromServerRaw;
  //     try {
  //       arrFromServerRaw = StitchObjectMapper.getInstance().writeValueAsString(arrFromServer);
  //     } catch (final JsonProcessingException e) {
  //       fail(e.getMessage());
  //       return;
  //     }
  //     doReturn(new Response(arrFromServerRaw)).when(requestClient).doRequest(any());

  //     @SuppressWarnings("unchecked")
  //     final List<Object> list = auth.doAuthenticatedJsonRequest(
  //         reqBuilder.build(),
  //         List.class,
  //         BsonUtils.DEFAULT_CODEC_REGISTRY);
  //     assertEquals(arrFromServer, list);
  //   }
});
