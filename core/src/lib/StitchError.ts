import ContentTypes from "./internal/net/ContentTypes";
import Headers from "./internal/net/Headers";
import Response from "./internal/net/Response";
import StitchRequestException from "./StitchRequestException";
import { StitchServiceErrorCode } from "./StitchServiceErrorCode";
import StitchServiceException from "./StitchServiceException";
import StitchException from "./StitchException";
import { StitchRequestErrorCode } from "./StitchRequestErrorCode";

enum Fields {
  ERROR = "error",
  ERROR_CODE = "error_code"
}

export default class StitchError {

  /**
   * Static utility method that accepts an error object, and returns it 
   * as is if it's a StitchException, or wraps it in a StitchRequestException
   * decoding error if it's not.
   * 
   * @param err The error to check and potentially wrap.
   */
  public static wrapDecodingError(err: any): StitchException {
    if (err instanceof StitchException) {
      return err;
    }

    return new StitchRequestException(err, StitchRequestErrorCode.DECODING_ERROR)
  }

  /**
   * Static utility method that accepts an HTTP response object, and throws the
   * StitchServiceException representing the the error in the response. If the error cannot be
   * recognized, this will throw a StitchServiceException with the "UNKNOWN" error code.
   *
   * @param response The network response.
   */
  public static handleRequestError(response: Response): never {
    if (response.body === undefined) {
      throw new StitchServiceException(
        `received unexpected status code ${response.statusCode}`,
        StitchServiceErrorCode.UNKNOWN
      )
    }
    
    let body: string

    try {
      body = response.body as string
    } catch (e) {
      throw new StitchServiceException(
        `received unexpected status code ${response.statusCode}`,
        StitchServiceErrorCode.UNKNOWN
      )
    }

    const errorMsg: string = StitchError.handleRichError(response, body);

    // if the above function call didn't throw, throw an unknown error here
    throw new StitchServiceException(errorMsg, StitchServiceErrorCode.UNKNOWN);
  }

  /**
   * Private helper method which decodes the Stitch error from the body of an HTTP `Response`
   * object. If the error is successfully decoded, this function will throw the error for the end
   * user to eventually consume. If the error cannot be decoded, this is likely not an error from
   * the Stitch server, and this function will return an error message that the calling function
   * should use as the message of a StitchServiceException with an unknown code.
   */
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
    throw new StitchServiceException(errorMsg, StitchServiceErrorCode[errorCode]);
  }
}
