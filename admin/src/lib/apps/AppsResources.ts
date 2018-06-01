import { Apps, checkEmpty, App } from "../Resources";
import * as EJSON from "mongodb-extjson";
import { Method, StitchAuthRequest } from "stitch-core";
import { Codec } from "stitch-core";

enum Fields {
  Id = "_id",
  Name = "name",
  ClientAppId = "client_app_id"
}

/// View into a specific application
export interface AppResponse {
  /// unique, internal id of this application
  readonly id: String;
  /// name of this application
  readonly name: String;
  /// public, client app id (for `StitchClient`) of this application
  readonly clientAppId: String;
}

export class AppResponseCodec implements Codec<AppResponse> {
  decode(from: object): AppResponse {
    return {
      id: from[Fields.Id],
      name: from[Fields.Name],
      clientAppId: from[Fields.ClientAppId]
    };
  }

  encode(from: AppResponse): object {
    return {
      [Fields.Id]: from.id,
      [Fields.Name]: from.name,
      [Fields.ClientAppId]: from.clientAppId
    };
  }
}
