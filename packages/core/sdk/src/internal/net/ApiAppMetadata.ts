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

import { EJSON } from "bson"

enum Fields {
  DEPLOYMENT_MODEL = "deployment_model",
  LOCATION = "location",
  HOSTNAME = "hostname"
}

/**
 * @hidden
 * A class representing a Stitch application's metadata.
 */
export default class ApiAppMetadata {
  public static fromJSON(json: object): ApiAppMetadata {
    return new ApiAppMetadata(
      json[Fields.DEPLOYMENT_MODEL],
      json[Fields.LOCATION],
      json[Fields.HOSTNAME]
    );
  }

  public readonly deploymentModel : string;
  public readonly location : string;
  public readonly hostname : string;

  public constructor(
    deploymentModel: string,
    location: string,
    hostname: string,
    ) {
      this.deploymentModel = deploymentModel;
      this.location = location;
      this.hostname = hostname;
  }

  public toJSON(): object {
    return {
      [Fields.DEPLOYMENT_MODEL]: this.deploymentModel,
      [Fields.LOCATION]: this.location,
      [Fields.HOSTNAME]: this.hostname
    };
  }
}