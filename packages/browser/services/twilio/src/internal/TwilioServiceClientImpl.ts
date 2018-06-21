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

import { CoreTwilioServiceClient } from "mongodb-stitch-core-services-twilio";
import { TwilioServiceClient } from "../TwilioServiceClient";

/** @hidden */
export default class TwilioServiceClientImpl implements TwilioServiceClient {
  public constructor(private readonly proxy: CoreTwilioServiceClient) {}
  /**
   * Sends an SMS/MMS message.
   *
   * @param to the number to send the message to.
   * @param from the number that the message is from.
   * @param body the body text of the message.
   * @param mediaUrl the Url of the media to send in an MMS.
   * @return a task that completes when the send is done.
   */
  public sendMessage(
    to: string,
    from: string,
    body: string,
    mediaUrl?: string
  ): Promise<void> {
    return this.proxy.sendMessage(to, from, body, mediaUrl);
  }
}
