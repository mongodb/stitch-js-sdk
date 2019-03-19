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

import { NamedServiceClientFactory } from "mongodb-stitch-browser-core";
import {
  CoreStitchServiceClient,
  StitchAppClientInfo
} from "mongodb-stitch-core-sdk";
import { CoreTwilioServiceClient } from "mongodb-stitch-core-services-twilio";
import TwilioServiceClientImpl from "./internal/TwilioServiceClientImpl";

/**
 * The Twilio service client.
 */
export interface TwilioServiceClient {
  /**
   * Sends an SMS/MMS message.
   *
   * @param to the number to send the message to.
   * @param from the number that the message is from.
   * @param body the body text of the message.
   * @param mediaUrl the Url of the media to send in an MMS.
   * @return a Promise that resolves when the send is done.
   */
  sendMessage(
    to: string,
    from: string,
    body: string,
    mediaUrl?: string
  ): Promise<void>;
}

export namespace TwilioServiceClient {
  export const factory: NamedServiceClientFactory<
    TwilioServiceClient
  > = new class implements NamedServiceClientFactory<TwilioServiceClient> {
    public getNamedClient(
      service: CoreStitchServiceClient,
      client: StitchAppClientInfo
    ): TwilioServiceClient {
      return new TwilioServiceClientImpl(new CoreTwilioServiceClient(service));
    }
  }();
}
