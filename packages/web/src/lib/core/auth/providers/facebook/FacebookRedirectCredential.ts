import { FacebookAuthProvider, ProviderCapabilities } from "stitch-core";
import StitchRedirectCredential from "../StitchRedirectCredential";

export default class FacebookRedirectCredential
  implements StitchRedirectCredential {
  public readonly providerName = FacebookAuthProvider.DEFAULT_NAME;

  public readonly providerType = FacebookAuthProvider.TYPE;

  /**
   * The contents of this credential as they will be passed to the Stitch server.
   */
  public readonly material: { [key: string]: string } = {};

  /**
   * The behavior of this credential when logging in.
   */
  public readonly providerCapabilities = new ProviderCapabilities(false);

  public readonly materialContainsAuthInfo = false;
}
