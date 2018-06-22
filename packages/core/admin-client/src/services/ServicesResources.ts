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

enum Fields {
  Id = "_id",
  Name = "name",
  Type = "type"
}

export interface ServiceResponse {
  readonly id: string;
  readonly name: string;
  readonly type: string;
}

export class ServiceResponseCodec implements Codec<ServiceResponse> {
  public decode(from: any): ServiceResponse {
    return {
      id: from[Fields.Id],
      name: from[Fields.Name],
      type: from[Fields.Type]
    };
  }

  public encode(from: ServiceResponse): object {
    return {
      [Fields.Id]: from.id,
      [Fields.Name]: from.name,
      [Fields.Type]: from.type
    };
  }
}
