import StitchException from "./StitchException";

/**
 * An exception indicating that an error occurred when using the Stitch client, typically before the
 * client performed a request. An error code indicating the reason for the error is included.
 */
export default class StitchClientException extends StitchException {
    /**
     * The {@link StitchClientErrorCode} associated with the request.
     */
    public readonly errorCode: StitchClientErrorCode;

    /**
     * Constructs a client exception with the given error code.
     */
    public constructor(errorCode: StitchClientErrorCode) {
        super()
        this.errorCode = errorCode;
    }
}
