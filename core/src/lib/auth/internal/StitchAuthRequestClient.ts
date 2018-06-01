import Response from "../../internal/net/Response";
import { StitchAuthDocRequest } from "../../internal/net/StitchAuthDocRequest";
import { StitchAuthRequest } from "../../internal/net/StitchAuthRequest";

/**
 * An interface defining the methods necessary to make authenticated requests to the Stitch server.
 */
export default interface StitchAuthRequestClient {
  /**
   * Performs an authenticated request to the Stitch server, using the current authentication state, and should
   * throw when not currently authenticated.
   *
   * - returns: The response to the request as a `Response`.
   */
  doAuthenticatedRequest(stitchReq: StitchAuthRequest): Promise<Response>;

  /**
   * Performs an authenticated request to the Stitch server with a JSON request body, using the current
   * authentication state, and should throw when not currently authenticated.
   *
   * - returns: An `Any` representing the response body as decoded JSON.
   */
  doAuthenticatedJSONRequest(stitchReq: StitchAuthDocRequest): Promise<any>;
}
