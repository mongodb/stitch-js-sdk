import { APIStitchUserIdentity } from "stitch-core";
import { Codec, Decoder } from "./Codec";

enum StitchAdminUserProfileFields {
  UserType = "type",
  Identities = "identities",
  Data = "data",
  Roles = "roles"
}

/**
 * A struct containing the fields returned by the Stitch client API in a user profile request.
 */
export interface StitchAdminUserProfile {
  /**
   * A string describing the type of this user.
   */
  readonly userType: string;

  /**
   * An array of `StitchUserIdentity` objects representing the identities linked
   * to this user which can be used to log in as this user.
   */
  readonly identities: APIStitchUserIdentity[];

  /**
   * An object containing extra metadata about the user as supplied by the authentication provider.
   */
  readonly data: object;

  /**
   * A list of the roles that this admin user has.
   */
  readonly roles: StitchAdminRole[];
}

export class StitchAdminUserProfileCodec
  implements Decoder<StitchAdminUserProfile> {
  decode(from: object): StitchAdminUserProfile {
    const roleCodec = new StitchAdminRoleCodec();

    return {
      userType: from[StitchAdminUserProfileFields.UserType],
      identities: from[StitchAdminUserProfileFields.Identities].map(identity =>
        APIStitchUserIdentity.decodeFrom(identity)
      ),
      data: from[StitchAdminUserProfileFields.Data],
      roles: from[StitchAdminUserProfileFields.Roles].map(role =>
        roleCodec.decode(role)
      )
    };
  }
}

enum StitchAdminRoleFields {
  Name = "role_name",
  GroupId = "group_id"
}

export interface StitchAdminRole {
  readonly name: string;
  readonly groupId: string;
}

export class StitchAdminRoleCodec implements Decoder<StitchAdminRole> {
  decode(from: object): StitchAdminRole {
    return {
      name: from[StitchAdminRoleFields.Name],
      groupId: from[StitchAdminRoleFields.GroupId]
    };
  }
}
