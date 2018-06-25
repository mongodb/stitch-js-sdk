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
  NamedServiceClientFactory,
  StitchServiceClient
} from "mongodb-stitch-browser-core";
import { StitchAppClientInfo } from "mongodb-stitch-core-sdk";
import {
  AwsSesSendResult,
  CoreAwsSesServiceClient
} from "mongodb-stitch-core-services-aws-ses";
import AwsSesServiceClientImpl from "./internal/AwsSesServiceClientImpl";

/**
 * The AWS SES service client.
 */
export interface AwsSesServiceClient {
  /**
   * Sends an email.
   *
   * @param to the email address to send the email to.
   * @param from the email address to send the email from.
   * @param subject the subject of the email.
   * @param body the body text of the email.
   * @return a Promise containing the result of the send that completes when the send is done.
   */
  sendEmail(
    to: string,
    from: string,
    subject: string,
    body: string
  ): Promise<AwsSesSendResult>;
}

export namespace AwsSesServiceClient {
  export const factory: NamedServiceClientFactory<
    AwsSesServiceClient
  > = new class implements NamedServiceClientFactory<AwsSesServiceClient> {
    public getNamedClient(
      service: StitchServiceClient,
      client: StitchAppClientInfo
    ): AwsSesServiceClient {
      return new AwsSesServiceClientImpl(new CoreAwsSesServiceClient(service));
    }
  }();
}
