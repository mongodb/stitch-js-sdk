import StitchException from "./StitchException";
import StitchRequestException from "./StitchRequestException";
import { StitchServiceErrorCode } from "./StitchServiceErrorCode";

/**
 * A StitchServiceException is an exception indicating that an error came from the Stitch server
 * after a request was completed, with an error message and an error code defined in the
 * `StitchServiceErrorCode` enum.
 *
 * It is possible that the error code will be `UNKNOWN`, which can mean one of several
 * possibilities: the Stitch server returned a message that this version of the SDK does not yet
 * recognize, the server is not a Stitch server and returned an unexpected message, or the response
 * was corrupted. In these cases, the associated message will be the plain text body of the
 * response, or an empty string if the body is empty or not decodable as plain text.
 */
export default class StitchServiceException extends StitchException {
  /**
   * The StitchServiceErrorCode indicating the reason for this exception.
   */
  public readonly errorCode: StitchServiceErrorCode;

  /**
   * A string describing the reason for the error.
   */
  public readonly message: string;

  public constructor(
    message: string,
    errorCode: StitchServiceErrorCode = StitchServiceErrorCode.Unknown
  ) {
    super();
    this.message = message;
    this.errorCode = errorCode;
  }
}
