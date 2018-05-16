/**
 * A class representing an identity that a Stitch user is linked to and can use to sign into their account.
 */
export default class StitchUserIdentity {
  /**
   * The id of this identity in MongoDB Stitch
   *
   * - important: This is **not** the id of the Stitch user.
   */
  public readonly id: string;
  /**
   * A string indicating the authentication provider that provides this identity.
   */
  public readonly providerType: string;

  protected constructor(id: string, providerType: string) {
    this.id = id;
    this.providerType = providerType;
  }
}
