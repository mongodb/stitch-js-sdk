import { AuthProvider, AuthProviders } from "../Resources";
import { Codec } from "stitch-core";

/// View into a specific auth provider
enum Fields {
  ID = "_id",
  DISABLED = "disabled",
  NAME = "name",
  TYPE = "type"
}

export interface AuthProviderResponse {
  /// unique id of this provider
  readonly id: string;
  /// whether or not this provider is disabled
  readonly disabled: boolean;
  /// name of this provider
  readonly name: string;
  /// the type of this provider
  readonly type: string;
}

export class AuthProviderResponseCodec implements Codec<AuthProviderResponse> {
  decode(from: object): AuthProviderResponse {
    return {
      id: from[Fields.ID],
      disabled: from[Fields.DISABLED],
      name: from[Fields.NAME],
      type: from[Fields.TYPE]
    };
  }

  encode(from: AuthProviderResponse): object {
    return {
      [Fields.ID]: from.id,
      [Fields.DISABLED]: from.disabled,
      [Fields.NAME]: from.name,
      [Fields.TYPE]: from.type
    };
  }
}

/// GET an auth provider
/// - parameter providerId: id of the provider
AuthProviders.prototype["authProvider"] = (
  providerId: string
): AuthProvider => {
  return new AuthProvider(this.adminAuth, `${this.url}/${providerId}`);
};
