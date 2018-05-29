import { APIStitchUserIdentity } from "stitch-core";
/**
 * A struct containing the fields returned by the Stitch client API in a user profile request.
 */
class StitchAdminUserProfile {
    private static userTypeKey = "type";
    private static identitiesKey = "identities";
    private static dataKey = "data";
    private static rolesKey = "roles";

    /**
     * A string describing the type of this user.
     */
    public readonly userType: string

    /**
     * An array of `StitchUserIdentity` objects representing the identities linked
     * to this user which can be used to log in as this user.
     */
    public readonly identities: [APIStitchUserIdentity]

    /**
     * An object containing extra metadata about the user as supplied by the authentication provider.
     */
    public readonly data: Map<String, String>

    /**
     * A list of the roles that this admin user has.
     */
    public readonly roles: [StitchAdminRole]

    public constructor(object: object) {
        this.userType = object[StitchAdminUserProfile.userTypeKey];
        this.identities = object[StitchAdminUserProfile.identitiesKey];
        this.data = object[StitchAdminUserProfile.dataKey];
        this.roles = object[StitchAdminUserProfile.rolesKey];
    }
}

class StitchAdminRole {
    public readonly name: string
    public readonly groupId: string

    private static nameKey = "role_name"
    private static groupIdKey = "group_id"

    public constructor(object: object) {
        this.name = object[StitchAdminRole.nameKey];
        this.groupId = object[StitchAdminRole.groupIdKey];
    }
}

export { StitchAdminUserProfile, StitchAdminRole };