import * as EJSON from "mongodb-extjson";
import { Method, StitchAuthRequest } from "mongodb-stitch-core-sdk";
import { Codec } from "mongodb-stitch-core-sdk";
import { App, Apps, checkEmpty } from "../Resources";

enum Fields {
  Id = "_id",
  Name = "name",
  ClientAppId = "client_app_id"
}

/// View into a specific application
export interface AppResponse {
  /// unique, internal id of this application
  readonly id: string;
  /// name of this application
  readonly name: string;
  /// public, client app id (for `StitchClient`) of this application
  readonly clientAppId: string;
}

export class AppResponseCodec implements Codec<AppResponse> {
  public decode(from: object): AppResponse {
    return {
      clientAppId: from[Fields.ClientAppId],
      id: from[Fields.Id],
      name: from[Fields.Name]
    };
  }

  public encode(from: AppResponse): object {
    return {
      [Fields.Id]: from.id,
      [Fields.Name]: from.name,
      [Fields.ClientAppId]: from.clientAppId
    };
  }
}
