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

import StitchAuthRequestClient from "../auth/internal/StitchAuthRequestClient";
import StitchAppRoutes from "../internal/net/StitchAppRoutes";
import Method from "./net/Method";
import { StitchAuthDocRequest } from "./net/StitchAuthDocRequest";
import { StitchAuthRequest } from "./net/StitchAuthRequest";

/** @hidden */
export default class CoreStitchAppClient {
  private readonly authRequestClient: StitchAuthRequestClient;
  private readonly routes: StitchAppRoutes;

  public constructor(
    authRequestClient: StitchAuthRequestClient,
    routes: StitchAppRoutes
  ) {
    this.authRequestClient = authRequestClient;
    this.routes = routes;
  }

  public callFunctionInternal<T>(name: string, args: any[]): Promise<T> {
    return this.authRequestClient.doAuthenticatedRequestWithDecoder(
      this.getCallFunctionRequest(name, args)
    );
  }

  private getCallFunctionRequest(name: string, args: any[]): StitchAuthRequest {
    const body = {
      arguments: args,
      name
    };

    const reqBuilder = new StitchAuthDocRequest.Builder();
    reqBuilder.withMethod(Method.POST).withPath(this.routes.functionCallRoute);
    reqBuilder.withDocument(body);
    return reqBuilder.build();
  }
}
