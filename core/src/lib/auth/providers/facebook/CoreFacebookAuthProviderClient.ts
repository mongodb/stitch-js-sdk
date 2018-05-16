import FacebookCredential from "./FacebookCredential";

export default class CoreFacebookAuthProviderClient {
  private readonly providerName: string;

  protected constructor(providerName: string) {
    this.providerName = providerName;
  }

  public getCredential(accessToken: string): FacebookCredential {
    return new FacebookCredential(this.providerName, accessToken);
  }
}
