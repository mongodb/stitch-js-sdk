import { AuthProvider, AuthProviders } from "../Resources";

/// View into a specific auth provider
enum Fields {
    ID = "_id",
    DISABLED = "disabled",
    NAME = "name",
    TYPE = "type",
}

class AuthProviderResponse {
    /// unique id of this provider
    public readonly id: string
    /// whether or not this provider is disabled
    public readonly disabled: boolean
    /// name of this provider
    public readonly name: string
    /// the type of this provider
    public readonly type: string

    public constructor(object: object) {
        this.id = object[Fields.ID];
        this.disabled = object[Fields.DISABLED];
        this.name = object[Fields.NAME];
        this.type = object[Fields.TYPE];
    }
}

/// GET an auth provider
/// - parameter providerId: id of the provider
AuthProviders.prototype["authProvider"] = (providerId: string): AuthProvider => {
    return new AuthProvider(this.adminAuth,
                            `${this.url}/${providerId}`);
}