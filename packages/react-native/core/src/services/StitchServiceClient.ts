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
import { Decoder } from "mongodb-stitch-core-sdk";

/**
 * StitchServiceClient acts as a general purpose client for working with 
 * services that are not defined or well defined by this SDK. It functions 
 * similarly to 
 * {@link com.mongodb.stitch.android.core.StitchAppClient#callFunction}.
 */
export default interface StitchServiceClient {
  /**
   * Calls the specified Stitch service function.
   *
   * @param name the name of the Stitch service function to call.
   * @param args the arguments to pass to the function.
   * @param codec the optional codec to use to decode the result of the 
   *              function call.
   * @returns a {@link Promise} that resolves when the request completes.
   */
  callFunction<T>(
    name: string, 
    args: any[], 
    codec?: Decoder<T>
  ): Promise<T>;
}
