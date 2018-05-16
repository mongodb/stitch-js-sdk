import ContentTypes from "./internal/net/ContentTypes";
import Headers from "./internal/net/Headers";
import Response from "./internal/net/Response";
import { StitchErrorCode } from "./StitchErrorCode";
import StitchRequestException from "./StitchRequestException";
import StitchServiceException from "./StitchServiceException";

enum Fields {
  ERROR = "error",
  ERROR_CODE = "error_code"
}

export default class StitchError {
  /**
   * Handles a network request error (non-200 family), looking for any embedded errors or codes.
   *
   * @param response The network response.
   */
  public static handleRequestError(response: Response): never {
    if (response.body === undefined) {
      throw new StitchRequestException(
        `received unexpected status code ${response.statusCode}`
      );
    }

    let body: string;
    try {
      body = response.body as string;
    } catch (e) {
      throw new StitchRequestException(e);
    }

    const errorMsg = StitchError.handleRichError(response, response.body);
    if (response.statusCode >= 400 && response.statusCode < 600) {
      throw new StitchServiceException(errorMsg);
    }
    throw new StitchRequestException(errorMsg);
  }

  private static handleRichError(response: Response, body: string): string {
    if (
      response.headers[Headers.CONTENT_TYPE] !== undefined ||
      response.headers[Headers.CONTENT_TYPE] !== ContentTypes.APPLICATION_JSON
    ) {
      return body;
    }

    const bsonObj = JSON.parse(body);
    if (!(bsonObj instanceof Object)) {
      return body;
    }

    const doc = bsonObj as object;

    if (doc[Fields.ERROR] === undefined) {
      return body;
    }
    const errorMsg = doc[Fields.ERROR] as string;
    if (doc[Fields.ERROR_CODE] === undefined) {
      return errorMsg;
    }

    const errorCode = doc[Fields.ERROR_CODE] as string;
    throw new StitchServiceException(errorMsg, StitchErrorCode[errorCode]);
  }
}
