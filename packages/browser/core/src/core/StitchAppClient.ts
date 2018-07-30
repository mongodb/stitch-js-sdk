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

import NamedServiceClientFactory from "../services/internal/NamedServiceClientFactory";
import ServiceClientFactory from "../services/internal/ServiceClientFactory";
import StitchAuth from "./auth/StitchAuth";
import StitchServiceClient from "../services/StitchServiceClient";

/**
 * The fundamental set of methods for communicating with a MongoDB Stitch 
 * application. Contains methods for executing Stitch functions and retrieving 
 * clients for Stitch services, and contains a `StitchAuth` object to manage 
 * the authentication state of the client. An implementation can be 
 * instantiated using the `Stitch` utility class.
 */
export default interface StitchAppClient {
  /**
   * The {@link StitchAuth} object representing the authentication state of 
   * this client. Includes methods for logging in and logging out.
   *
   * Authentication state can be persisted beyond the lifetime of a browser 
   * session. A StitchAppClient retrieved from the `Stitch` singleton may or 
   * may not be already authenticated when first initialized.
   */
  auth: StitchAuth;

  /**
   * Retrieves the service client for the Stitch service associated with the 
   * specified name and factory.
   * 
   * @param factory The factory that produces the desired service client.
   * @param serviceName The name of the desired service in MongoDB Stitch.
   */
  getServiceClient<T>(
    factory: NamedServiceClientFactory<T>,
    serviceName: string
  ): T;

  /**
   * Retrieves the service client for the Stitch service associated with the 
   * specificed factory.
   * 
   * @param factory The factory that produces the desired service client.
   */
  getServiceClient<T>(factory: ServiceClientFactory<T>): T;

  /**
   * Retrieves a general-purpose service client for the Stitch service
   * associated with the specified name. Use this for services which do not
   * have a well-defined interface in the SDK.
   * 
   * @param serviceName The name of the desired service in MongoDB Stitch.
   */
  getGeneralServiceClient(serviceName: string): StitchServiceClient;

  /**
   * Calls the MongoDB Stitch function with the provided name and arguments,
   * and returns the result as decoded extended JSON.
   * 
   * @param name The name of the function to call.
   * @param args The arguments to the function.
   */
  callFunction(name: string, args: any[]): Promise<any>;
}
