import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import ProviderTypes from "../ProviderTypes";

enum Fields {
  KEY = "key"
}

/**
 * A credential which can be used to log in as a Stitch user
 * using the User API Key authentication provider.
 */
export default class UserAPIKeyCredential implements StitchCredential {
  /**
   * The name of the provider for this credential.
   */
  public readonly providerName: string;
  /**
   * The user API key contained within this credential.
   */
  public readonly key: string;
  /**
   * The type of the provider for this credential.
   */
  public readonly providerType = ProviderTypes.USER_API_KEY;
  /**
   * The contents of this credential as they will be passed to the Stitch server.
   */
  public readonly material: { [key: string]: string } = {
    [Fields.KEY]: this.key
  };
  /**
   * The behavior of this credential when logging in.
   */
  public readonly providerCapabilities = new ProviderCapabilities(false);

  constructor(key: string, providerName: string = ProviderTypes.USER_API_KEY) {
    this.providerName = providerName;
    this.key = key;
  }
}
