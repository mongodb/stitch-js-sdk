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
import { AwsS3PutObjectResult } from "../AwsS3PutObjectResult";
import { AwsS3SignPolicyResult } from "../AwsS3SignPolicyResult";

enum AwsS3PutObjectFields {
  Location = "location"
}

class AwsS3PutObjectResultDecoder implements Decoder<AwsS3PutObjectResult> {
  public decode(from: object): AwsS3PutObjectResult {
    return {
      location: from[AwsS3PutObjectFields.Location]
    };
  }
}

enum AwsS3SignPolicyFields {
  Policy = "policy",
  Signature = "signature",
  Algoritm = "algorithm",
  Date = "date",
  Credential = "credential"
}

class AwsS3SignPolicyResultDecoder implements Decoder<AwsS3SignPolicyResult> {
  public decode(from: object): AwsS3SignPolicyResult {
    return {
      algorithm: from[AwsS3SignPolicyFields.Algoritm],
      credential: from[AwsS3SignPolicyFields.Credential],
      date: from[AwsS3SignPolicyFields.Date],
      policy: from[AwsS3SignPolicyFields.Policy],
      signature: from[AwsS3SignPolicyFields.Signature]
    };
  }
}

export default class ResultDecoders {
  public static PutObjectResultDecoder: Decoder<
    AwsS3PutObjectResult
  > = new AwsS3PutObjectResultDecoder();

  public static SignPolicyResultDecoder: Decoder<
    AwsS3SignPolicyResult
  > = new AwsS3SignPolicyResultDecoder();
}
