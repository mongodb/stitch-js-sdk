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

export default interface StitchAppClient {
  auth: StitchAuth;

  getServiceClient<T>(
    factory: NamedServiceClientFactory<T>,
    serviceName: string
  ): T;

  getServiceClient<T>(factory: ServiceClientFactory<T>): T;

  callFunction(name: string, args: any[]): Promise<any>;
}
