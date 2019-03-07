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

import { Decoder } from "../../internal/common/Codec";
import Stream from "../../Stream";
import StitchServiceBinder from "./StitchServiceBinder";

/** @hidden */
export default interface CoreStitchServiceClient extends StitchServiceBinder {
  callFunction<T>(
    name: string,
    args: any[],
    decoder?: Decoder<T>
  ): Promise<T>;

  streamFunction<T>(
    name: string,
    args: any[],
    decoder?: Decoder<T>
  ): Promise<Stream<T>>;

  /**
   * Bind a given service to this service client.
   * 
   * @param binder the service binder that links the service to this client
   */
  bind(binder: StitchServiceBinder)
}
