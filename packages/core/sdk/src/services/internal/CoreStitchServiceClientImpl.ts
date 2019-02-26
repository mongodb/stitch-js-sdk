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

import { EJSON } from 'bson';
import StitchAuthRequestClient from "../../auth/internal/StitchAuthRequestClient";
import { base64Encode } from "../../internal/common/Base64";
import { Decoder } from "../../internal/common/Codec";
import Method from "../../internal/net/Method";
import { StitchAuthDocRequest } from "../../internal/net/StitchAuthDocRequest";
import { StitchAuthRequest } from "../../internal/net/StitchAuthRequest";
import Stream from "../../Stream";
import CoreStitchServiceClient from "./CoreStitchServiceClient";
import StitchServiceRoutes from "./StitchServiceRoutes";

/** @hidden */
export default class CoreStitchServiceClientImpl
  implements CoreStitchServiceClient {
  private readonly requestClient: StitchAuthRequestClient;
  private readonly serviceRoutes: StitchServiceRoutes;
  private readonly serviceName: string | undefined;

  private readonly serviceField = "service";
  private readonly argumentsField = "arguments";

  public constructor(
    requestClient: StitchAuthRequestClient,
    routes: StitchServiceRoutes,
    name?: string
  ) {
    this.requestClient = requestClient;
    this.serviceRoutes = routes;
    this.serviceName = name;
  }

  public callFunction<T>(
    name: string,
    args: any[],
    decoder?: Decoder<T>
  ): Promise<T> {
    return this.requestClient.doAuthenticatedRequestWithDecoder(
      this.getCallServiceFunctionRequest(name, args),
      decoder
    );
  }

  public streamFunction<T>(
    name: string,
    args: any[],
    decoder?: Decoder<T>
  ): Promise<Stream<T>> {
    return this.requestClient.openAuthenticatedStreamWithDecoder(
      this.getStreamServiceFunctionRequest(name, args),
      decoder
    );
  }

  private getStreamServiceFunctionRequest(
    name: string,
    args: any[]
  ): StitchAuthRequest {
    const body = { name };
    if (this.serviceName !== undefined) {
      body[this.serviceField] = this.serviceName;
    }
    body[this.argumentsField] = args;

    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.GET)
      .withPath(this.serviceRoutes.functionCallRoute +
        `?stitch_request=${encodeURIComponent(base64Encode(EJSON.stringify(body)))}`);
    return reqBuilder.build();
  }

  private getCallServiceFunctionRequest(
    name: string,
    args: any[]
  ): StitchAuthRequest {
    const body = { name };
    if (this.serviceName !== undefined) {
      body[this.serviceField] = this.serviceName;
    }
    body[this.argumentsField] = args;

    const reqBuilder = new StitchAuthDocRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.serviceRoutes.functionCallRoute);
    reqBuilder.withDocument(body);
    return reqBuilder.build();
  }
}
