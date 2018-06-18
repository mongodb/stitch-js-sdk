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

import StitchRequestClient from "../../../internal/net/StitchRequestClient";
import { StitchAuthRoutes } from "../../internal/StitchAuthRoutes";

/**
 * The class from which all Core auth provider clients inherit. Only auth
 * provider clients that make requests to the Stitch server need to inherit this class.
 */
export default abstract class CoreAuthProviderClient<RequestClientType> {
  /**
   * Construct a new CoreAuthProviderClient
   * @param providerName The name of the authentication provider.
   * @param requestClient The request client used by the client to make requests.
   * Is of a generic type since some auth provider clients
   * use an authenticated request client while others use an unauthenticated request client.
   * @param baseRoute The base route for this authentication provider client.
   */
  protected constructor(
    protected readonly providerName: string,
    protected readonly requestClient: RequestClientType,
    protected readonly baseRoute: string
  ) {}
}
