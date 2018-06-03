import { Codec } from "stitch-core";
import { AuthProvider, AuthProviders } from "../Resources";

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
  public decode(from: object): AuthProviderResponse {
    return {
      disabled: from[Fields.DISABLED],
      id: from[Fields.ID],
      name: from[Fields.NAME],
      type: from[Fields.TYPE]
    };
  }

  public encode(from: AuthProviderResponse): object {
    return {
      [Fields.ID]: from.id,
      [Fields.DISABLED]: from.disabled,
      [Fields.NAME]: from.name,
      [Fields.TYPE]: from.type
    };
  }
}

