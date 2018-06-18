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
