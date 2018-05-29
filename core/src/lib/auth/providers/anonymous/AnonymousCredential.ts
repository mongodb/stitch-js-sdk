import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import AnonymousAuthProvider from "./AnonymousAuthProvider";

/**
 * A credential which can be used to log in as a Stitch user
 * using the anonymous authentication provider.
 */
export default class AnonymousCredential implements StitchCredential {
  /**
   * The name of the provider for this credential.
   */
  public readonly providerName: string;
  /**
   * The type of the provider for this credential.
   */
  public readonly providerType = AnonymousAuthProvider.TYPE;
  /**
   * The contents of this credential as they will be passed to the Stitch server.
   */
  public readonly material = {};
  /**
   * The behavior of this credential when logging in.
   */
  public readonly providerCapabilities = new ProviderCapabilities(true);

  constructor(providerName: string = AnonymousAuthProvider.DEFAULT_NAME) {
    this.providerName = providerName;
  }
}
