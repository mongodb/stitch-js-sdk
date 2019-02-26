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
  CoreStitchServiceClient, 
  StitchAppClientInfo 
} from "mongodb-stitch-core-sdk";
import {
  CoreHttpServiceClient,
  HttpRequest,
  HttpResponse
} from "mongodb-stitch-core-services-http";
import { NamedServiceClientFactory } from "mongodb-stitch-server-core";

import HttpServiceClientImpl from "./internal/HttpServiceClientImpl";

/**
 * The HTTP service client.
 */
export interface HttpServiceClient {
  /**
   * Executes the given {@link HttpRequest}.
   *
   * @param request the request to execute.
   * @return a Promise containing the response to executing the request.
   */
  execute(request: HttpRequest): Promise<HttpResponse>;
}

export namespace HttpServiceClient {
  export const factory: NamedServiceClientFactory<HttpServiceClient> = new class
    implements NamedServiceClientFactory<HttpServiceClient> {
    public getNamedClient(
      service: CoreStitchServiceClient,
      client: StitchAppClientInfo
    ): HttpServiceClient {
      return new HttpServiceClientImpl(new CoreHttpServiceClient(service));
    }
  }();
}
