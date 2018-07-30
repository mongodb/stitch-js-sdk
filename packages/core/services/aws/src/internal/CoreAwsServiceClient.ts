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

import { Decoder } from "mongodb-stitch-core-sdk"
import { CoreStitchServiceClient } from "mongodb-stitch-core-sdk";
import { AwsRequest } from "../AwsRequest"

enum Fields {
  ExecuteActionName = "execute",
  ServiceParam = "aws_service",
  ActionParam = "aws_action",
  RegionParam = "aws_region",
  ArgumentsParam = "aws_arguments"
}

export default class CoreAwsServiceClient {
  public constructor(private readonly service: CoreStitchServiceClient) {}

  /**
   * Executes the AWS request.
   * 
   * @param request the AWS request to execute.
   * @param decoder the optional decoder to use to decode the result into a 
   *                value
   */
  public execute<T>(request: AwsRequest, decoder?: Decoder<T>): Promise<T> {
    return this.service.callFunction(
      Fields.ExecuteActionName,
      [this.getRequestArgs(request)],
      decoder
    )
  }

  private getRequestArgs(request: AwsRequest): object {
    const args = {
      [Fields.ServiceParam]: request.service,
      [Fields.ActionParam]: request.action,
      [Fields.ArgumentsParam]: request.args
    }

    if (request.region) {
      args[Fields.RegionParam] = request.region
    }

    return args
  }
}
