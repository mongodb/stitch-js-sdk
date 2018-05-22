import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import ProviderTypes from "../ProviderTypes";

enum Fields {
  KEY = "key"
}

/**
 * A credential which can be used to log in as a Stitch user
 * using the Server API Key authentication provider.
 */
export default class ServerAPIKeyCredential implements StitchCredential {
  /**
   * The name of the provider for this credential.
   */
  public readonly providerName: string;
  /**
   * The type of the provider for this credential.
   */
  public readonly providerType = ProviderTypes.SERVER_API_KEY;
  /**
   * The contents of this credential as they will be passed to the Stitch server.
   */
  public readonly material: { [key: string]: string } = (() => {
    return { [Fields.KEY]: this.key };
  })();
  /**
   * The behavior of this credential when logging in.
   */
  public readonly providerCapabilities = new ProviderCapabilities(false);
  /**
   * The server API key contained within this credential.
   */
  private readonly key: string;

  constructor(key: string, providerName: string = ProviderTypes.SERVER_API_KEY) {
    this.providerName = providerName;
    this.key = key;
  }
}
