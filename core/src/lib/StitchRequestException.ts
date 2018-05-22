import StitchException from "./StitchException";
import { StitchRequestErrorCode } from "./StitchRequestErrorCode"

/**
 * Indicates that an error occurred while a request was being carried out. This could be due to (but
 * is not limited to) an unreachable server, a connection timeout, or an inability to decode the
 * result. An error code is included, which indicates whether the error was a transport error or
 * decoding error. The underlyingError property can be read to see that underlying error that caused 
 * a StitchRequestException. In the case of transport errors, these errors are thrown by the 
 * underlying Transport of the Stitch client. An error in decoding the result from the server 
 * is typically an Error thrown internally by the Stitch SDK.
 */
export default class StitchRequestException extends StitchException {
    /**
     * The StitchRequestErrorCode indicating the reason for this exception.
     */
    public readonly errorCode: StitchRequestErrorCode;

    /**
     * The underlying Error that caused this request exception.
     */
    private readonly underlyingError: Error;

  /**
   * Constructs a request exception from the underlying exception and error code.
   */
  public constructor(
      underlyingError: Error, errorCode: StitchRequestErrorCode) {
    super();
    this.underlyingError = underlyingError;
    this.errorCode = errorCode;
  }
}
