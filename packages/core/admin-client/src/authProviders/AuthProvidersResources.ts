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

import { Codec } from "mongodb-stitch-core-sdk";
import { AuthProvider, AuthProviders } from "../Resources";

/// View into a specific auth provider
enum Fields {
  ID = "_id",
  DISABLED = "disabled",
  NAME = "name",
  TYPE = "type"
}

export interface AuthProviderResponse {
  /// Unique id of this provider
  readonly id: string;
  /// Whether or not this provider is disabled
  readonly disabled: boolean;
  /// Name of this provider
  readonly name: string;
  /// The type of this provider
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
