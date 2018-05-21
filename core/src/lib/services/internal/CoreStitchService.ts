import StitchAuthRequestClient from "../../auth/internal/StitchAuthRequestClient";
import Method from "../../internal/net/Method";
import StitchAuthDocRequest from "../../internal/net/StitchAuthDocRequest";
import StitchServiceRoutes from "./StitchServiceRoutes";

export default abstract class CoreStitchService {
  private readonly requestClient: StitchAuthRequestClient;
  private readonly serviceRoutes: StitchServiceRoutes;
  private readonly serviceName: string;

  protected constructor(
    requestClient: StitchAuthRequestClient,
    routes: StitchServiceRoutes,
    name: string
  ) {
    this.requestClient = requestClient;
    this.serviceRoutes = routes;
    this.serviceName = name;
  }

  protected callFunctionInternal(name: string, ...args: any[]): any {
    return this.requestClient.doAuthenticatedJSONRequest(
      this.getCallServiceFunctionRequest(name, args)
    );
  }

  private getCallServiceFunctionRequest(
    name: string,
    ...args: any[]
  ): StitchAuthDocRequest {
    const body = {
      name: name,
      service: this.serviceName,
      arguments: args
    }

    return new StitchAuthDocRequest.Builder()
      .withMethod(Method.POST)
      .withPath(this.serviceRoutes.functionCallRoute)
      .withDocument(body)
      .build();
  }
}
