import AuthInfo from "../../internal/AuthInfo";
import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";

export default class StitchAuthResponseCredential implements StitchCredential {
  /**
   * A `ProviderCapabilities` object describing the behavior of this credential when logging in.
   */
  public providerCapabilities: ProviderCapabilities;

  /**
   * The contents of this credential as they will be passed to the Stitch server.
   */
  public readonly material: { [key: string]: string };

  /**
   * The contents of this credential as they will be
   * processed and stored
   */
  public constructor(
    public readonly authInfo: AuthInfo,
    public readonly providerType: string,
    public readonly providerName: string
  ) {}
}
