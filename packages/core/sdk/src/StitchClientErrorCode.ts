/**
 * StitchClientErrorCode represents the errors that can occur when using the Stitch client,
 * typically before a request is made to the Stitch server.
 */
export enum StitchClientErrorCode {
  LoggedOutDuringRequest,
  MissingUrl,
  MustAuthenticateFirst,
  UserNoLongerValid,
  CouldNotLoadPersistedAuthInfo,
  CouldNotPersistAuthInfo
}
