import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import CustomAuthProvider from "./CustomAuthProvider";

const TOKEN: string = "token";

/**
 * A credential which can be used to log in as a Stitch user
 * using the Custom authentication provider.
 */
export default class CustomCredential implements StitchCredential {
  /**
   * The name of the provider for this credential.
   */
  public providerName: string;
  /**
   * The type of the provider for this credential.
   */
  public readonly providerType = CustomAuthProvider.TYPE;
  /**
   * The behavior of this credential when logging in.
   */
  public readonly providerCapabilities = new ProviderCapabilities(false);
  /**
   * The JWT contained within this credential.
   */
  private token: string;

  constructor(
    token: string,
    providerName: string = CustomAuthProvider.DEFAULT_NAME
  ) {
    this.providerName = providerName;
    this.token = token;
  }

  /**
   * The contents of this credential as they will be passed to the Stitch server.
   */
  public get material(): { [key: string]: string } {
    return { [TOKEN]: this.token };
  }
}
