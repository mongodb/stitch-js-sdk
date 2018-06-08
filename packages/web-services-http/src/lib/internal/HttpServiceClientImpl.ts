import {
  CoreHttpServiceClient,
  HttpRequest,
  HttpResponse
} from "stitch-core-services-http";
import { HttpServiceClient } from "../HttpServiceClient";

export default class HttpServiceClientImpl implements HttpServiceClient {
  public constructor(private readonly proxy: CoreHttpServiceClient) {}

  /**
   * Executes the given {@link HttpRequest}.
   *
   * @param request the request to execute.
   * @return a task containing the response to executing the request.
   */
  public execute(request: HttpRequest): Promise<HttpResponse> {
    return this.proxy.execute(request);
  }
}
