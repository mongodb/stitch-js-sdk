import { StitchAppClientInfo } from "mongodb-stitch-core-sdk";
import {
  CoreHttpServiceClient,
  HttpRequest,
  HttpResponse
} from "mongodb-stitch-core-services-http";
import { NamedServiceClientFactory, StitchServiceClient } from "mongodb-stitch-browser-core";
import HttpServiceClientImpl from "./internal/HttpServiceClientImpl";

/**
 * The HTTP service client.
 */
export interface HttpServiceClient {
  /**
   * Executes the given {@link HttpRequest}.
   *
   * @param request the request to execute.
   * @return a task containing the response to executing the request.
   */
  execute(request: HttpRequest): Promise<HttpResponse>;
}

export class HttpService {
  public static readonly Factory: NamedServiceClientFactory<
    HttpServiceClient
  > = new class implements NamedServiceClientFactory<HttpServiceClient> {
    public getClient(
      service: StitchServiceClient,
      appInfo: StitchAppClientInfo
    ): HttpServiceClient {
      return new HttpServiceClientImpl(new CoreHttpServiceClient(service));
    }
  }();
}
