import {
  StitchServiceRoutes,
  StitchAuthRequestClient,
  CoreStitchAuth
} from "../../../lib";
import { mock, when, instance, anyOfClass, verify, capture } from "ts-mockito";
import { StitchAuthDocRequest } from "../../../lib/internal/net/StitchAuthDocRequest";
import Method from "../../../lib/internal/net/Method";
import CoreStitchServiceImpl from "../../../lib/services/internal/CoreStitchServiceImpl";

describe("CoreStitchServiceUnitTests", () => {
  it("should call function internal", () => {
    const serviceName = "svc1";
    const routes = new StitchServiceRoutes("foo");

    const requestClientMock = mock(CoreStitchAuth);

    when(
      requestClientMock.doAuthenticatedJSONRequest(
        anyOfClass(StitchAuthDocRequest)
      )
    ).thenReturn(Promise.resolve(42));

    const requestClient: StitchAuthRequestClient = instance(requestClientMock);

    const coreStitchService = new CoreStitchServiceImpl(
      requestClient,
      routes,
      serviceName
    );

    const funcName = "myFunc1";
    const args = [1, 2, 3];
    const expectedRequestDoc = {};
    expectedRequestDoc["name"] = funcName;
    expectedRequestDoc["service"] = serviceName;
    expectedRequestDoc["arguments"] = args;

    return coreStitchService
      .callFunctionInternal(funcName, args)
      .then(response => {
        expect(response).toBe(42);

        const [docArgument] = capture(
          requestClientMock.doAuthenticatedJSONRequest
        ).first();
        verify(
          requestClientMock.doAuthenticatedJSONRequest(
            anyOfClass(StitchAuthDocRequest)
          )
        ).called();

        expect(docArgument.method).toEqual(Method.POST);
        expect(docArgument.path).toEqual(routes.functionCallRoute);
        expect(docArgument.document).toEqual(expectedRequestDoc);
      });
  });
});
