/**
 * StitchClientErrorCode represents the errors that can occur when using the Stitch client,
 * typically before a request is made to the Stitch server.
 */
export enum StitchClientErrorCode {
    LOGGED_OUT_DURING_REQUEST,
    MISSING_URL,
    MUST_AUTHENTICATE_FIRST,
    USER_NO_LONGER_VALID,
    COULD_NOT_LOAD_PERSISTED_AUTH_INFO,
    COULD_NOT_PERSIST_AUTH_INFO
}