/**
 * Defines the behavior of a credential based on its authentication provider.
 */
export default class ProviderCapabilities {
  /**
   * A bool indicating whether or not logging in with this credential will re-use the existing authenticated session
   * if there is one. If this is true, then no authentication with the server will be performed if the client is
   * already authenticated, and the existing session will be used. If this is false, then the client will log out of
   * its existing session if it is already logged in.
   */
  public readonly reusesExistingSession: boolean;

  public constructor(reusesExistingSession: boolean = false) {
    this.reusesExistingSession = reusesExistingSession;
  }
}
