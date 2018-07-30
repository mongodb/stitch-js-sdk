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
  AwsRequest, 
  CoreAwsServiceClient 
} from "mongodb-stitch-core-services-aws";
import { Decoder } from "mongodb-stitch-core-sdk";
import { AwsServiceClient } from "../AwsServiceClient";

 /**
  * The AWS service client.
  */
export default class AwsServiceClientImpl implements AwsServiceClient {
  
  public constructor(private readonly proxy: CoreAwsServiceClient) {}

  execute<T>(
    request: AwsRequest,
    decoder?: Decoder<T>
  ): Promise<T> {
    return this.proxy.execute(request, decoder);
  }
}
