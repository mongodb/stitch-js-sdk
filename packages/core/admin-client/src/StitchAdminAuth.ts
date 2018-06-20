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
  CoreStitchAuth,
  DeviceFields,
  StitchAuthRoutes,
  StitchRequestClient,
  StitchUserFactory,
  Storage
} from "mongodb-stitch-core-sdk";
import { StitchAdminUser, StitchAdminUserFactory } from "./StitchAdminUser";

/**
 * A special implementation of CoreStitchAuth that communicates with the MongoDB Stitch Admin API.
 */
export default class StitchAdminAuth extends CoreStitchAuth<StitchAdminUser> {
  public get userFactory(): StitchUserFactory<StitchAdminUser> {
    return new StitchAdminUserFactory();
  }

  public get deviceInfo(): { [key: string]: string } {
    const info = {};

    if (this.hasDeviceId) {
      info[DeviceFields.DEVICE_ID] = this.deviceId;
    }

    info[DeviceFields.APP_ID] = "MongoDB Stitch Swift Admin Client";

    return info;
  }

  public constructor(
    requestClient: StitchRequestClient,
    authRoutes: StitchAuthRoutes,
    storage: Storage
  ) {
    super(requestClient, authRoutes, storage);
  }

  public onAuthEvent() {
    // do nothing
  }
}
