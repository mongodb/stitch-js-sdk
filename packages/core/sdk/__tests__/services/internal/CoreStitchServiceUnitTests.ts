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

import {
  anyOfClass,
  anything,
  capture,
  instance,
  mock,
  verify,
  when,
  spy
} from "ts-mockito";
import {
  CoreStitchAuth,
  StitchAuthRequestClient,
  StitchServiceRoutes,
  RebindEvent,
  AuthEventKind,
  AuthRebindEvent,
  CoreStitchUserImpl,
  Stream
} from "../../../src";
import Method from "../../../src/internal/net/Method";
import { StitchAuthDocRequest } from "../../../src/internal/net/StitchAuthDocRequest";
import { StitchAuthRequest } from "../../../src/internal/net/StitchAuthRequest";
import CoreStitchServiceClientImpl from "../../../src/services/internal/CoreStitchServiceClientImpl";
import StitchServiceBinder from "../../../src/services/internal/StitchServiceBinder";
import { StreamTestUtils, TestStream } from "../../StreamTestUtils";

/** @hidden */
interface CoreStitchServiceUnitTestContext {
  serviceName: string,
  routes: StitchServiceRoutes,
  requestClientMock: CoreStitchAuth<any>,
  requestClient: StitchAuthRequestClient,
  testService: CoreStitchServiceClientImpl
}

class DummyUser extends CoreStitchUserImpl {
  constructor() {
    super("1234", "provider-type", "provider-name", true, new Date());
  }
}

/** @hidden */
// Mockito does not yet support mocking interfaces but it will soon
// - https://github.com/NagRock/ts-mockito/issues/117
class FakeStitchServiceBinder implements StitchServiceBinder {
  onRebindEvent(_: RebindEvent) { }
}

function setUp(): CoreStitchServiceUnitTestContext {
  const serviceName = "svc1";
  const routes = new StitchServiceRoutes("foo");

  const requestClientMock = mock(CoreStitchAuth);

  const requestClient: StitchAuthRequestClient = instance(requestClientMock);

  const testService = new CoreStitchServiceClientImpl(
    requestClient,
    routes,
    serviceName
  );

  return {
    serviceName,
    routes,
    requestClientMock,
    requestClient,
    testService
  };
}

describe("CoreStitchServiceUnitTests", () => {
  it("should call function", () => {
    const serviceName = "svc1";
    const routes = new StitchServiceRoutes("foo");

    const requestClientMock = mock(CoreStitchAuth);

    when(
      requestClientMock.doAuthenticatedRequestWithDecoder(
        anyOfClass(StitchAuthRequest),
        anything()
      )
    ).thenReturn(Promise.resolve(42));

    const requestClient: StitchAuthRequestClient = instance(requestClientMock);

    const coreStitchService = new CoreStitchServiceClientImpl(
      requestClient,
      routes,
      serviceName
    );

    const funcName = "myFunc1";
    const args = [1, 2, 3];
    const expectedRequestDoc = {
      arguments: args,
      name: funcName,
      service: serviceName
    };

    return coreStitchService
      .callFunction(funcName, args)
      .then(response => {
        expect(response).toBe(42);

        const [docArgument] = capture(
          requestClientMock.doAuthenticatedRequestWithDecoder
        ).last();
        verify(
          requestClientMock.doAuthenticatedRequestWithDecoder(
            anyOfClass(StitchAuthRequest),
            anything()
          )
        ).called();

        const req = docArgument as StitchAuthDocRequest;
        expect(req.method).toEqual(Method.POST);
        expect(req.path).toEqual(routes.functionCallRoute);
        expect(req.document).toEqual(expectedRequestDoc);
      });
  });

  it("should invoke proper binder callbacks on rebind", () => {
    const testCtx = setUp();
    const underTest = testCtx.testService;

    const binder1 = new FakeStitchServiceBinder();
    const binder2 = new FakeStitchServiceBinder();

    const spiedBinder1 = spy(binder1);
    const spiedBinder2 = spy(binder2);

    underTest.bind(binder1);
    underTest.bind(binder2);

    const event = new AuthRebindEvent({
      kind: AuthEventKind.ActiveUserChanged,
      previousActiveUser: undefined,
      currentActiveUser: undefined
    });

    underTest.onRebindEvent(event);

    verify(spiedBinder2.onRebindEvent(anyOfClass(AuthRebindEvent))).called();
    verify(spiedBinder1.onRebindEvent(anyOfClass(AuthRebindEvent))).called();
  });

  it("should not close streams on login event", () => {
    const testCtx = setUp();
    const underTest = testCtx.testService;

    const streams: Stream<any>[] = [];
    for (let i = 0; i < 10; i ++) {
      streams.push(
        StreamTestUtils.createStream(undefined, JSON.stringify({
          number: i
        }))
      );
    }

    when(testCtx.requestClientMock.openAuthenticatedStreamWithDecoder(
      anything(), anything()
    )).thenResolve(...streams);

    for (let i = 0; i < streams.length; i++) {
      underTest.streamFunction("fn", []);
    }

    underTest.onRebindEvent(new AuthRebindEvent({
      kind: AuthEventKind.UserLoggedIn,
      loggedInUser: new DummyUser()
    }));

    streams.forEach(stream => {
      // get around the fact that ts-mockito can't 
      // have method stubs return spied objects
      expect((stream as TestStream<any>).closeCalled).toBe(0);
    });
  });

  it("should not close streams on logout event", () => {
    const testCtx = setUp();
    const underTest = testCtx.testService;
    const streams: Stream<any>[] = [];
    for (let i = 0; i < 10; i ++) {
      streams.push(
        StreamTestUtils.createStream(undefined, JSON.stringify({
          number: i
        }))
      );
    }

    when(testCtx.requestClientMock.openAuthenticatedStreamWithDecoder(
      anything(), anything()
    )).thenResolve(...streams);

    for (let i = 0; i < streams.length; i++) {
      underTest.streamFunction("fn", []);
    }

    underTest.onRebindEvent(new AuthRebindEvent({
      kind: AuthEventKind.UserLoggedOut,
      loggedOutUser: new DummyUser()
    }));

    streams.forEach(stream => {
      // get around the fact that ts-mockito can't 
      // have method stubs return spied objects
      expect((stream as TestStream<any>).closeCalled).toBe(0);
    });
  });

  it("should not close streams on remove event", () => {
    const testCtx = setUp();
    const underTest = testCtx.testService;
    const streams: Stream<any>[] = [];
    for (let i = 0; i < 10; i ++) {
      streams.push(
        StreamTestUtils.createStream(undefined, JSON.stringify({
          number: i
        })
      ));
    }

    when(testCtx.requestClientMock.openAuthenticatedStreamWithDecoder(
      anything(), anything()
    )).thenResolve(...streams);

    for (let i = 0; i < streams.length; i++) {
      underTest.streamFunction("fn", []);
    }

    underTest.onRebindEvent(new AuthRebindEvent({
      kind: AuthEventKind.UserRemoved,
      removedUser: new DummyUser()
    }));

    streams.forEach(stream => {
      // get around the fact that ts-mockito can't 
      // have method stubs return spied objects
      expect((stream as TestStream<any>).closeCalled).toBe(0);
    });
  });

  it("should close streams on active user changed event", async () => {
    const testCtx = setUp();
    const underTest = testCtx.testService;

    const streams: Stream<any>[] = [];
    for (let i = 0; i < 10; i ++) {
      let stream = StreamTestUtils.createStream(undefined, JSON.stringify({
        number: i
      }));
      streams.push(stream);
    }

    when(testCtx.requestClientMock.openAuthenticatedStreamWithDecoder(
      anything(), anything()
    )).thenResolve(...streams);

    for (let i = 0; i < streams.length; i++) {
      await underTest.streamFunction("fn", []);
    }

    underTest.onRebindEvent(new AuthRebindEvent({
      kind: AuthEventKind.ActiveUserChanged,
      currentActiveUser: new DummyUser(),
      previousActiveUser: new DummyUser()
    }));

    streams.forEach(stream => {
      // get around the fact that ts-mockito can't 
      // have method stubs return spied objects
      expect((stream as TestStream<any>).closeCalled).toBe(1);
    });
  });

  it("should skip closing closed streams on rebind", () => {
    const testCtx = setUp();
    const underTest = testCtx.testService;
    const stream = spy(StreamTestUtils.createClosedStream(
      undefined, 
      JSON.stringify({hello: "there"})
    ))

    when(testCtx.requestClientMock.openAuthenticatedStreamWithDecoder(
      anything(), anything()
    )).thenResolve(stream);

    underTest.streamFunction("fn", []);

    underTest.onRebindEvent(new AuthRebindEvent({
      kind: AuthEventKind.ActiveUserChanged,
      currentActiveUser: new DummyUser(),
      previousActiveUser: new DummyUser()
    }));

    verify(stream.close()).never();
  });
});
