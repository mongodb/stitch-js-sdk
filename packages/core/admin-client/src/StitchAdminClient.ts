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
  FetchTransport,
  MemoryStorage,
  StitchRequestClient,
} from "mongodb-stitch-core-sdk";
import AppsRoutes from "./internal/routes/AppsRoutes";
import { AppsResource } from "./resources/AppsResource";
import StitchAdminAuth from "./StitchAdminAuth";
import StitchAdminAuthRoutes from "./StitchAdminAuthRoutes";
import { StitchAdminClientConfiguration } from "./StitchAdminClientConfiguration";
import { StitchAdminResourceRoutes } from "./StitchAdminResourceRoutes";
import {
  StitchAdminUserProfile,
  StitchAdminUserProfileCodec
} from "./StitchAdminUserProfile";

const apiPath = "/api/admin/v3.0";
const defaultServerUrl = "https://stitch.mongodb.com";

export default class StitchAdminClient {
  public readonly adminAuth: StitchAdminAuth;
  private readonly resourceRoutes = new StitchAdminResourceRoutes(apiPath);
  private readonly authRoutes: StitchAdminAuthRoutes;

  public constructor(
    adminClientConfiguration: StitchAdminClientConfiguration
  ) {
    const builder = adminClientConfiguration.builder();

    if (builder.baseUrl === undefined) {
      builder.withBaseUrl(defaultServerUrl)
    }
    if (builder.storage === undefined) {
      builder.withStorage(new MemoryStorage("<admin>"))
    }
    if (builder.transport === undefined) {
      builder.transport = new FetchTransport();
    }

    const requestClient = new StitchRequestClient(builder.baseUrl!, builder.transport!);

    this.authRoutes = new StitchAdminAuthRoutes(apiPath);

    this.adminAuth = new StitchAdminAuth(
      requestClient,
      this.authRoutes,
      builder.storage!
    );
  }

  public apps(groupId: string): AppsResource {
    return new AppsResource(
      this.adminAuth,
      new AppsRoutes(this.resourceRoutes, groupId)
    );
  }
}
