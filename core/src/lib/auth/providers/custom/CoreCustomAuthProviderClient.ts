import CustomCredential from "./CustomCredential";

/**
 * A client for the custom authentication provider which can be used to obtain a credential for logging in.
 */
export default class CoreCustomAuthProviderClient {
  /**
   * The name of the provider.
   */
  private readonly providerName: string;

  protected constructor(providerName: string) {
    this.providerName = providerName;
  }

  /**
   * Returns a credential for the provider, with the provided JWT.
   */
  public getCredential(token: string): CustomCredential {
    return new CustomCredential(this.providerName, token);
  }
}
