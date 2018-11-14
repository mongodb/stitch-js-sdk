/**
 * Copyright 2018-present MongoDB, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { EJSON } from "bson";
import { Codec, Method, StitchAuthRequest } from "mongodb-stitch-core-sdk";
import { App, Apps, checkEmpty } from "../Resources";

enum Fields {
  Id = "_id",
  Name = "name",
  ClientAppId = "client_app_id"
}

/// View into a specific application
export interface AppResponse {
  /// Unique, internal id of this application
  readonly id: string;
  /// Name of this application
  readonly name: string;
  /// Public, client app id (for `StitchClient`) of this application
  readonly clientAppId: string;
}

export class AppResponseCodec implements Codec<AppResponse> {
  public decode(from: any): AppResponse {
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
