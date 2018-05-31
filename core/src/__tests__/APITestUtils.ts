import APIAuthInfo from "../lib/auth/internal/models/APIAuthInfo";
import { StitchRequestClient } from "../lib";
import APICoreUserProfile from "../lib/auth/internal/models/APICoreUserProfile";
import APIStitchUserIdentity from "../lib/auth/internal/models/APIStitchUserIdentity";
import { sign } from "jsonwebtoken";
import {
  mock,
  when,
  anyOfClass,
  match,
  objectContaining,
  instance
} from "ts-mockito";
import { Matcher } from "ts-mockito/lib/matcher/type/Matcher";
import { BasicRequest } from "../lib/internal/net/BasicRequest";
import { StitchRequest } from "../lib/internal/net/StitchRequest";
import Method from "../lib/internal/net/Method";

expect.extend({
  toEqualRequest(received: StitchRequest, argument: StitchRequest) {
    const passed =
      received.method === argument.method &&
      received.body === argument.body &&
      JSON.stringify(received.headers) === JSON.stringify(argument.headers) &&
      received.path === argument.path;

    if (passed) {
      return {
        message: () =>
          this.utils.matcherHint(".not.toBe") +
          "\n\n" +
          `Expected value to be (using Object.is):\n` +
          `  ${this.utils.printExpected(argument)}\n` +
          `Received:\n` +
          `  ${this.utils.printReceived(received)}`,
        pass: true
      };
    } else {
      return {
        message: () =>
          this.utils.matcherHint(".not.toBe") +
          "\n\n" +
          `Expected value to not be (using Object.is):\n` +
          `  ${this.utils.printExpected(argument)}\n` +
          `Received:\n` +
          `  ${this.utils.printReceived(received)}`,
        pass: false
      };
    }
  }
});

declare global {
  namespace jest {
    // tslint:disable-next-line:interface-name
    interface Matchers<R> {
      toEqualRequest(argument: StitchRequest): R;
    }
  }
}

/**
 * Gets an access token JWT for testing that is always the same.
 */
export const TEST_ACCESS_TOKEN: string = (() => {
  const claims = {
    typ: "access"
  };

  return sign(
    {
      claims: claims,
      iat: new Date().getMilliseconds() - 1000 * 1000,
      sub: "uniqueUserID",
      exp: new Date().getMilliseconds() + 1000 * 1000
    },
    "abcdefghijklmnopqrstuvwxyz1234567890"
  );
})();

/**
 * Gets an refresh token JWT for testing that is always the same.
 */
export const TEST_REFRESH_TOKEN: string = (() => {
  const claims = {
    typ: "refresh"
  };

  return sign(
    {
      claims: claims,
      iat: new Date().getMilliseconds() - 1000 * 1000,
      sub: "uniqueUserID"
    },
    "abcdefghijklmnopqrstuvwxyz1234567890"
  );
})();

/**
 * Gets a login response for testing that is always the same.
 */
export const TEST_LOGIN_RESPONSE: APIAuthInfo = (() => {
  return new class extends APIAuthInfo {
    constructor() {
      super(
        "some-unique-user-id",
        "0123456012345601234560123456",
        TEST_ACCESS_TOKEN,
        TEST_REFRESH_TOKEN
      );
    }
  }();
})();

/**
 * Gets a link response for testing that is always the same.
 */
export const TEST_LINK_RESPONE: APIAuthInfo = (() => {
  return new class extends APIAuthInfo {
    constructor() {
      super(
        "some-unique-user-id",
        "0123456012345601234560123456",
        TEST_ACCESS_TOKEN,
        TEST_REFRESH_TOKEN
      );
    }
  }();
})();

/**
 * Gets a user profile for testing that is always the same.
 */
export const TEST_USER_PROFILE: APICoreUserProfile = (() => {
  const identities = [
    new class extends APIStitchUserIdentity {
      constructor() {
        super("bar", "baz");
      }
    }()
  ];

  return new class extends APICoreUserProfile {
    constructor() {
      super("normal", {}, identities);
    }
  }();
})();

export class RequestClassMatcher extends Matcher {
  constructor(
    private readonly pathRegEx?: RegExp,
    private readonly method?: Method
  ) {
    super();
  }

  match(value: any): boolean {
    if (value instanceof StitchRequest) {
      if (this.pathRegEx && !this.pathRegEx.test(value.path)) {
        return false;
      }

      if (this.method && this.method !== value.method) {
        return false;
      }

      return true;
    }

    return false;
  }

  toString(): string {
    return `Did not match ${this.pathRegEx} or method ${this.method}`;
  }
}

/**
 * Gets a mocked request client for testing that can be extended. In general
 * it supports enough to return responses for login, profile, and link. Anything else
 * will return null {@link Response}s.
 */
export function getMockedRequestClient(): StitchRequestClient {
  const requestClientMock = mock(StitchRequestClient);

  // Any /login works
  when(
    requestClientMock.doRequest(<any>new RequestClassMatcher(
      new RegExp(".*/login")
    ))
  ).thenResolve({
    statusCode: 200,
    headers: {},
    body: JSON.stringify(TEST_LOGIN_RESPONSE)
  });

  // Profile works if the access token is the same as the above
  when(
    requestClientMock.doRequest(<any>new RequestClassMatcher(
      new RegExp(".*/profile")
    ))
  ).thenResolve({
    statusCode: 200,
    headers: {},
    body: JSON.stringify(TEST_USER_PROFILE)
  });

  // Link works if the access token is the same as the above
  when(
    requestClientMock.doRequest(<any>new RequestClassMatcher(
      new RegExp(".*/login?link=true")
    ))
  ).thenResolve({
    statusCode: 200,
    headers: {},
    body: JSON.stringify(TEST_USER_PROFILE)
  });

  return requestClientMock;
}

export function getAuthorizationBearer(accessToken: string): string {
  return "Bearer " + accessToken;
}
