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

import BSON from "mongodb-stitch-bson";
import {
  NamedServiceClientFactory,
  StitchServiceClient
} from "mongodb-stitch-server-core";
import { StitchAppClientInfo } from "mongodb-stitch-core-sdk";
import {
  AwsS3PutObjectResult,
  AwsS3SignPolicyResult,
  CoreAwsS3ServiceClient
} from "mongodb-stitch-core-services-aws-s3";
import AwsS3ServiceClientImpl from "./internal/AwsS3ServiceClientImpl";

/**
 * The AWS S3 service client.
 */
export interface AwsS3ServiceClient {
  /**
   * Puts an object.
   *
   * @param bucket the bucket to put the object in.
   * @param key the key (or name) of the object.
   * @param acl the ACL to apply to the object (e.g. private).
   * @param contentType the content type of the object (e.g. application/json).
   * @param body the body of the object.
   * @return a Promise containing the result of the put, which contains the location of the object.
   */
  putObject(
    bucket: string,
    key: string,
    acl: string,
    contentType: string,
    body: string | BSON.Binary | Uint8Array | ArrayBuffer | Buffer
  ): Promise<AwsS3PutObjectResult>;

  /**
   * Signs an AWS S3 security policy for a future put object request. This future request would
   * be made outside of the Stitch SDK. This is typically used for large requests that are better
   * sent directly to AWS.
   * @see <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-post-example.html">Uploading a File to Amazon S3 Using HTTP POST</a>
   *
   * @param bucket the bucket to put the future object in.
   * @param key the key (or name) of the future object.
   * @param acl the ACL to apply to the future object (e.g. private).
   * @param contentType the content type of the object (e.g. application/json).
   * @return a Promise containing the signed policy details.
   */
  signPolicy(
    bucket: string,
    key: string,
    acl: string,
    contentType: string
  ): Promise<AwsS3SignPolicyResult>;
}

export namespace AwsS3ServiceClient {
  export const factory: NamedServiceClientFactory<
    AwsS3ServiceClient
  > = new class implements NamedServiceClientFactory<AwsS3ServiceClient> {
    public getNamedClient(
      service: StitchServiceClient,
      client: StitchAppClientInfo
    ): AwsS3ServiceClient {
      return new AwsS3ServiceClientImpl(new CoreAwsS3ServiceClient(service));
    }
  }();
}
