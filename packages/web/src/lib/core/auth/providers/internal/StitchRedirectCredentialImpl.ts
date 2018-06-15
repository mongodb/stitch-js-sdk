import { AuthInfo, ProviderCapabilities } from "stitch-core";
import StitchRedirectCredential from "../StitchRedirectCredential";

export default class StitchRedirectCredentialImpl
  implements StitchRedirectCredential {
  public readonly materialContainsAuthInfo = true;
  public readonly material = {};
  public readonly providerCapabilities = new ProviderCapabilities(false);

  constructor(
    public readonly providerName: string,
    public readonly providerType: string,
    private readonly authInfo: AuthInfo
  ) {
    this.material = authInfo;
  }
}
