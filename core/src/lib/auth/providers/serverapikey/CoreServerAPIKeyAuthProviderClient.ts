import ServerAPIKeyCredential from "./ServerAPIKeyCredential";

/**
 * A client for the server API key authentication provider which can be used to obtain a credential for logging in.
 */
export default abstract class CoreServerAPIKeyAuthProviderClient {
  /**
   * The name of the provider.
   */
  private readonly providerName;

  protected constructor(providerName: string) {
    this.providerName = providerName;
  }

  /**
   * Returns a credential for the provider, with the provided server API key.
   */
  public getCredential(key: string): ServerAPIKeyCredential {
    return new ServerAPIKeyCredential(this.providerName, key);
  }
}
