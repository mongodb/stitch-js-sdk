import { Codec } from "../../..";
import StitchUserIdentity from "../../StitchUserIdentity";

enum Fields {
  Id = "id",
  ProviderType = "provider_type"
}

/**
 * A class describing the structure of how user identity information is stored in persisted `Storage`.
 */
export class StoreStitchUserIdentity extends StitchUserIdentity {
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

  public constructor(id: string, providerType: string) {
    super(id, providerType);
  }
}

export class StoreStitchUserIdentityCodec implements Codec<StoreStitchUserIdentity> {
  public decode(from: object): StoreStitchUserIdentity {
    return {
      id: from[Fields.Id],
      providerType: from[Fields.ProviderType]
    }
  }

  public encode(from: StoreStitchUserIdentity): object {
    return {
      [Fields.Id]: from.id,
      [Fields.ProviderType]: from.providerType
    }
  }
}