import AnonymousCredential from "./AnonymousCredential";

/**
 * A client for the anonymous authentication provider which can be used to obtain a credential for logging in.
 */
export default abstract class CoreAnonymousAuthProviderClient {
  /**
   * The name of the provider.
   */
  private readonly providerName: string;

  protected constructor(providerName: string) {
    this.providerName = providerName;
  }

  /**
   * Returns a credential for the provider.
   */
  public getCredential(): AnonymousCredential {
    return new AnonymousCredential(this.providerName);
  }
}
