import { Binary } from "bson";
import { NamedServiceClientFactory, StitchServiceClient } from "mongodb-stitch-browser-core";
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
   * @return the result of the put which contains the location of the object.
   */
  putObject(
    bucket: string,
    key: string,
    acl: string,
    contentType: string,
    body: string | Binary | Uint8Array | ArrayBuffer | Buffer
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
   * @return the signed policy details.
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
  > = new class
    implements NamedServiceClientFactory<AwsS3ServiceClient> {
    public getNamedClient(
      service: StitchServiceClient,
      client: StitchAppClientInfo
    ): AwsS3ServiceClient {
      return new AwsS3ServiceClientImpl(new CoreAwsS3ServiceClient(service));
    }
  }();
}
