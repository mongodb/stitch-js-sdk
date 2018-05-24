import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import FacebookAuthProvider from "./FacebookAuthProvider";

const ACCESS_TOKEN: string = "accessToken";

export default class FacebookCredential implements StitchCredential {
  public readonly providerName: string;
  public readonly providerType = FacebookAuthProvider.TYPE;

  private readonly accessToken: string;

  constructor(accessToken: string, providerName: string = FacebookAuthProvider.DEFAULT_NAME) {
    this.providerName = providerName;
    this.accessToken = accessToken;
  }

  public get material(): { [key: string]: string } {
    return {
      [ACCESS_TOKEN]: this.accessToken
    };
  }

  public get providerCapabilities(): ProviderCapabilities {
    return new ProviderCapabilities(false);
  }
}
