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

import { CoreStitchServiceClient } from "mongodb-stitch-core-sdk";
import AwsSesSendResult from "../AwsSesSendResult";

/** @hidden */
export default class CoreAwsSesServiceClient {
  public constructor(private readonly service: CoreStitchServiceClient) {}

  public sendEmail(
    toAddress: string,
    fromAddress: string,
    subject: string,
    body: string
  ): Promise<AwsSesSendResult> {
    const args = {
      body,
      fromAddress,
      subject,
      toAddress
    };

    return this.service.callFunctionInternal(
      "send",
      [args],
      AwsSesSendResult.Decoder
    );
  }
}
