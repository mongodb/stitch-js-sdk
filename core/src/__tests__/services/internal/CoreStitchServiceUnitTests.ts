import { anyOfClass, capture, instance, mock, verify, when } from "ts-mockito";
import {
  CoreStitchAuth,
  StitchAuthRequestClient,
  StitchServiceRoutes
} from "../../../lib";
import Method from "../../../lib/internal/net/Method";
import { StitchAuthDocRequest } from "../../../lib/internal/net/StitchAuthDocRequest";
import { StitchAuthRequest } from "../../../lib/internal/net/StitchAuthRequest";
import StitchServiceClient from "../../../lib/services/internal/StitchServiceClient";

describe("CoreStitchServiceUnitTests", () => {
  it("should call function internal", () => {
    const serviceName = "svc1";
    const routes = new StitchServiceRoutes("foo");

    const requestClientMock = mock(CoreStitchAuth);

    when(
      requestClientMock.doAuthenticatedJSONRequest(
        anyOfClass(StitchAuthRequest)
      )
    ).thenReturn(Promise.resolve(42));

    const requestClient: StitchAuthRequestClient = instance(requestClientMock);

    const coreStitchService = new StitchServiceClient(
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
      .callFunctionInternal(funcName, args)
      .then(response => {
        expect(response).toBe(42);

        const [docArgument] = capture(
          requestClientMock.doAuthenticatedJSONRequest
        ).last();
        verify(
          requestClientMock.doAuthenticatedJSONRequest(
            anyOfClass(StitchAuthRequest)
          )
        ).called();

        const req = docArgument as StitchAuthDocRequest;
        expect(req.method).toEqual(Method.POST);
        expect(req.path).toEqual(routes.functionCallRoute);
        expect(req.document).toEqual(expectedRequestDoc);
      });
  });
});
