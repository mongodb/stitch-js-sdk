import {
  CoreStitchServiceClient,
  StitchAuthRequestClient,
  StitchServiceRoutes
} from "../..";
import Method from "../../internal/net/Method";
import { StitchAuthDocRequest } from "../../internal/net/StitchAuthDocRequest";
import { StitchAuthRequest } from "../../internal/net/StitchAuthRequest";

export default class StitchServiceClient implements CoreStitchServiceClient {
  private readonly requestClient: StitchAuthRequestClient;
  private readonly serviceRoutes: StitchServiceRoutes;
  private readonly serviceName: string;

  public constructor(
    requestClient: StitchAuthRequestClient,
    routes: StitchServiceRoutes,
    name: string
  ) {
    this.requestClient = requestClient;
    this.serviceRoutes = routes;
    this.serviceName = name;
  }

  public callFunctionInternal<T>(name: string, args: any[]): Promise<T> {
    return this.requestClient.doAuthenticatedJSONRequest(
      this.getCallServiceFunctionRequest(name, args)
    );
  }

  private getCallServiceFunctionRequest(
    name: string,
    args: any[]
  ): StitchAuthRequest {
    const body = { name };
    if (this.serviceName !== undefined) {
      body["service"] = this.serviceName;
    }
    body["arguments"] = args;

    const reqBuilder = new StitchAuthDocRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.serviceRoutes.functionCallRoute);
    reqBuilder.withDocument(body);
    return reqBuilder.build();
  }
}
