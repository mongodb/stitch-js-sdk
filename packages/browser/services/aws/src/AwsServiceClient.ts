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

import {
  NamedServiceClientFactory
} from "mongodb-stitch-browser-core";
import { 
  CoreStitchServiceClient,
  Decoder,
  StitchAppClientInfo 
} from "mongodb-stitch-core-sdk";
import { 
  AwsRequest, 
  CoreAwsServiceClient 
} from "mongodb-stitch-core-services-aws";
import AwsServiceClientImpl from "./internal/AwsServiceClientImpl";

 /**
  * The AWS service client.
  */
export interface AwsServiceClient {
  
  /**
   * Executes the AWS request.
   * 
   * @param request the AWS request to execute.
   * @param decoder the optional decoder to use to decode the result into a 
   *                value.
   */
  execute<T>(
    request: AwsRequest,
    decoder?: Decoder<T>
  ): Promise<T>
}

export namespace AwsServiceClient {
  export const factory: NamedServiceClientFactory<
    AwsServiceClient
  > = new class implements NamedServiceClientFactory<AwsServiceClient> {
    public getNamedClient(
      service: CoreStitchServiceClient,
      client: StitchAppClientInfo
    ): AwsServiceClient {
      return new AwsServiceClientImpl(new CoreAwsServiceClient(service));
    }
  }();
}
