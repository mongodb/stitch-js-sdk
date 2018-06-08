import HttpCookie from "./HttpCookie";

/**
 * The response to an HTTP request over the HTTP service.
 */
export default class HttpResponse {
  /**
   * Constructs a new response to an HTTP request.
   *
   * @param status the human readable status of the response.
   * @param statusCode the status code of the response.
   * @param contentLength the content length of the response.
   * @param headers the response headers.
   * @param cookies the response cookies.
   * @param body the response body.
   */
  public constructor(
    public readonly status: string,
    public readonly statusCode: number,
    public readonly contentLength: number,
    public readonly headers: Record<string, string[]>,
    public readonly cookies: Record<string, HttpCookie>,
    public readonly body: string
  ) {}
}
