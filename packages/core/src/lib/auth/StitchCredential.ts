import ProviderCapabilities from "./ProviderCapabilities";

/**
 * A credential which can be used to log in as a Stitch user. There is an implementation for each authentication
 * provider available in MongoDB Stitch. These implementations can be generated using an authentication provider
 * client.
 */
export default interface StitchCredential {
  /**
   * The name of the authentication provider that this credential will be used to authenticate with.
   */
  readonly providerName: string;

  /**
   * The type of the authentication provider that this credential will be used to authenticate with.
   */
  readonly providerType: string;

  /**
   * The contents of this credential as they will be passed to the Stitch server.
   */
  readonly material: { [key: string]: string };

  /**
   * The contents of this credential contain authentication information.
   */
  readonly materialContainsAuthInfo?: boolean;

  /**
   * A `ProviderCapabilities` object describing the behavior of this credential when logging in.
   */
  providerCapabilities: ProviderCapabilities;
}
