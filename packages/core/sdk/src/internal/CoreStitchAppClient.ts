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
import { Decoder } from "../internal/common/Codec";
import StitchAppRoutes from "../internal/net/StitchAppRoutes";
import CoreStitchServiceClient from "../services/internal/CoreStitchServiceClient";
import CoreStitchServiceClientImpl from "../services/internal/CoreStitchServiceClientImpl";

/** @hidden */
export default class CoreStitchAppClient {
  private readonly functionService: CoreStitchServiceClient

  public constructor(
    authRequestClient: StitchAuthRequestClient,
    routes: StitchAppRoutes
  ) {
    this.functionService = 
    new CoreStitchServiceClientImpl(
      authRequestClient, 
      routes.serviceRoutes
    )
  }

  public callFunction<T>(
    name: string, 
    args: any[],
    decoder?: Decoder<T>
  ): Promise<T> {
    return this.functionService.callFunction(name, args, decoder);
  }
}
