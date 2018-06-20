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

import StitchUserIdentity from "../../StitchUserIdentity";

enum Fields {
  ID = "id",
  PROVIDER_TYPE = "provider_type"
}

export default class ApiStitchUserIdentity extends StitchUserIdentity {
  public static fromJSON(json: object): ApiStitchUserIdentity {
    return new ApiStitchUserIdentity(
      json[Fields.ID],
      json[Fields.PROVIDER_TYPE]
    );
  }

  protected constructor(id: string, providerType: string) {
    super(id, providerType);
  }

  public toJSON(): object {
    return {
      [Fields.ID]: this.id,
      [Fields.PROVIDER_TYPE]: this.providerType
    };
  }
}
