import { Binary } from "bson";
import { CoreStitchServiceClient } from "stitch-core";
import { AwsS3PutObjectResult } from "../AwsS3PutObjectResult";
import { AwsS3SignPolicyResult } from "../AwsS3SignPolicyResult";
import ResultDecoders from "./ResultDecoders";

enum PutAction {
  ActionName = "put",

  BucketParam = "bucket",
  KeyParam = "key",
  AclParam = "acl",
  ContentTypeParam = "contentType",
  BodyParam = "body"
}

enum SignPolicyAction {
  ActionName = "signPolicy",

  BucketParam = "bucket",
  KeyParam = "key",
  AclParam = "acl",
  ContentTypeParam = "contentType"
}

export default class CoreAwsS3ServiceClient {
  public constructor(private readonly service: CoreStitchServiceClient) {}

  public putObject(
    bucket: string,
    key: string,
    acl: string,
    contentType: string,
    body: string | Buffer | Uint8Array | ArrayBuffer | Binary
  ): Promise<AwsS3PutObjectResult> {
    const args = {
      [PutAction.BucketParam]: bucket,
      [PutAction.KeyParam]: key,
      [PutAction.AclParam]: acl,
      [PutAction.ContentTypeParam]: contentType
    };

    const binaryBody: Binary | string = (() => {
      if (body instanceof Buffer) {
        return new Binary(body);
      }

      if (body instanceof Uint8Array) {
        return new Binary(new Buffer(body));
      }

      if (body instanceof ArrayBuffer) {
        return new Binary(new Buffer(body));
      }

      return body;
    })();

    args[PutAction.BodyParam] = binaryBody;

    return this.service.callFunctionInternal(
      PutAction.ActionName,
      [args],
      ResultDecoders.PutObjectResultDecoder
    );
  }

  public signPolicy(
    bucket: string,
    key: string,
    acl: string,
    contentType: string
  ): Promise<AwsS3SignPolicyResult> {
    const args = {
      [SignPolicyAction.BucketParam]: bucket,
      [SignPolicyAction.KeyParam]: key,
      [SignPolicyAction.AclParam]: acl,
      [SignPolicyAction.ContentTypeParam]: contentType
    };

    return this.service.callFunctionInternal(
      SignPolicyAction.ActionName,
      [args],
      ResultDecoders.SignPolicyResultDecoder
    );
  }
}
