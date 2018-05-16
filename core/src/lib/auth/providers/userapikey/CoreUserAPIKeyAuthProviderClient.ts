import UserAPIKeyCredential from "./UserAPIKeyCredential";

/**
 * A client for the user API key authentication provider which can be used to obtain a credential for logging in.
 */
export default abstract class CoreUserAPIKeyAuthProviderClient {
  /**
   * The name of the provider.
   */
  private readonly providerName;

  protected constructor(providerName: string) {
    this.providerName = providerName;
  }

  /**
   * Returns a credential for the provider, with the provided user API key.
   */
  public getCredential(key: string): UserAPIKeyCredential {
    return new UserAPIKeyCredential(this.providerName, key);
  }
}
