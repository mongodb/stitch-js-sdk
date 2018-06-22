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

enum Fields {
  MessageId = "messageId"
}

/**
 * The result of an AWS SES send request.
 */
export default class AwsSesSendResult {
  /** @hidden */
  public static readonly Decoder = new class
    implements Decoder<AwsSesSendResult> {
    public decode(from: any): AwsSesSendResult {
      return { messageId: from[Fields.MessageId] };
    }
  }();

  /**
   * Constructs a result.
   * @param messageId the id of the sent message.
   */
  public constructor(public readonly messageId: string) {}
}
