import {
  NamedServiceClientFactory,
  StitchServiceClient
} from "mongodb-stitch-browser-core";
import { StitchAppClientInfo } from "mongodb-stitch-core-sdk";
import {
  CoreHttpServiceClient,
  HttpRequest,
  HttpResponse
} from "mongodb-stitch-core-services-http";
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

export namespace HttpServiceClient {
  export const factory: NamedServiceClientFactory<HttpServiceClient> = new class
    implements NamedServiceClientFactory<HttpServiceClient> {
    public getNamedClient(
      service: StitchServiceClient,
      client: StitchAppClientInfo
    ): HttpServiceClient {
      return new HttpServiceClientImpl(new CoreHttpServiceClient(service));
    }
  }();
}
