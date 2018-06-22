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

import CoreStitchServiceClient from "./CoreStitchServiceClient";
import StitchServiceRoutes from "./StitchServiceRoutes";
import StitchAuthRequestClient from "../../auth/internal/StitchAuthRequestClient";
import { Decoder } from "../../internal/common/Codec";
import Method from "../../internal/net/Method";
import { StitchAuthDocRequest } from "../../internal/net/StitchAuthDocRequest";
import { StitchAuthRequest } from "../../internal/net/StitchAuthRequest";

export default class CoreStitchServiceClientImpl
  implements CoreStitchServiceClient {
  private readonly requestClient: StitchAuthRequestClient;
  private readonly serviceRoutes: StitchServiceRoutes;
  private readonly serviceName: string;

  public constructor(
    requestClient: StitchAuthRequestClient,
    routes: StitchServiceRoutes,
    name: string
  ) {
    this.requestClient = requestClient;
    this.serviceRoutes = routes;
    this.serviceName = name;
  }

  public callFunctionInternal<T>(
    name: string,
    args: any[],
    decoder?: Decoder<T>
  ): Promise<T> {
    return this.requestClient.doAuthenticatedRequestWithDecoder(
      this.getCallServiceFunctionRequest(name, args),
      decoder
    );
  }

  private getCallServiceFunctionRequest(
    name: string,
    args: any[]
  ): StitchAuthRequest {
    const body = { name };
    if (this.serviceName !== undefined) {
      body["service"] = this.serviceName;
    }
    body["arguments"] = args;

    const reqBuilder = new StitchAuthDocRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.serviceRoutes.functionCallRoute);
    reqBuilder.withDocument(body);
    return reqBuilder.build();
  }
}
