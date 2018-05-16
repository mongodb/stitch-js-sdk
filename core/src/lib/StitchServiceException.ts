import { StitchErrorCode } from "./StitchErrorCode";
import StitchRequestException from "./StitchRequestException";

/**
 * A StitchServiceException is an exception that happens when the Stitch server has deemed a request
 * as failing for a reason. This exception captures that reason.
 */
export default class StitchServiceException extends StitchRequestException {
  public readonly errorCode: StitchErrorCode;

  public constructor(
    message: string,
    errorCode: StitchErrorCode = StitchErrorCode.UNKNOWN
  ) {
    super(message);
    this.errorCode = errorCode;
  }
}
