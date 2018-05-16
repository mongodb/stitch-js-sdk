import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import ProviderTypes from "../ProviderTypes";

enum Fields {
  AUTH_CODE = "authCode"
}

/**
 * A credential which can be used to log in as a Stitch user
 * using the Google authentication provider.
 */
export default class GoogleCredential implements StitchCredential {
  /**
   * The name of the provider for this credential.
   */
  public readonly providerName: string;
  /**
   * The type of the provider for this credential.
   */
  public readonly providerType = ProviderTypes.GOOGLE;

  /**
   * The contents of this credential as they will be passed to the Stitch server.
   */
  public readonly material: { [key: string]: string } = (() => {
    return { [Fields.AUTH_CODE]: this.authCode };
  })();

  /**
   * The behavior of this credential when logging in.
   */
  public readonly providerCapabilities = new ProviderCapabilities(false);

  /**
   * The Google OAuth2 authentication code contained within this credential.
   */
  private readonly authCode: string;

  constructor(providerName: string, authCode: string) {
    this.providerName = providerName;
    this.authCode = authCode;
  }
}
