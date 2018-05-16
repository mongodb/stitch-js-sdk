import GoogleCredential from "./GoogleCredential";

/**
 * A client for the Google authentication provider which can be used to obtain a credential for logging in.
 */
export default abstract class CoreGoogleAuthProviderClient {
  /**
   * The name of the provider.
   */
  private readonly providerName: string;

  protected constructor(providerName: string) {
    this.providerName = providerName;
  }

  /**
   * Returns a credential for the provider, with the provided Google OAuth2 authentication code.
   */
  public getCredential(authCode: string): GoogleCredential {
    return new GoogleCredential(this.providerName, authCode);
  }
}
