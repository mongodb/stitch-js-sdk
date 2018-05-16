import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import ProviderTypes from "../ProviderTypes";

const ACCESS_TOKEN: string = "accessToken";

export default class FacebookCredential implements StitchCredential {
  public readonly providerName: string;
  public readonly providerType = ProviderTypes.FACEBOOK;

  private readonly accessToken: string;

  constructor(providerName: string, accessToken: string) {
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
