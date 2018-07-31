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
  Anon,
  App,
  AppResponse,
  Aws,
  AwsRuleCreator,
  Service
} from "mongodb-stitch-core-admin-client";
import {
  FetchTransport,
  Method,
  StitchServiceError,
  StitchServiceErrorCode
} from "mongodb-stitch-core-sdk";
import { AwsRequest } from "mongodb-stitch-core-services-aws";
import { AnonymousCredential } from "mongodb-stitch-react-native-core";
import { BaseStitchRNIntTestHarness } from "mongodb-stitch-react-native-testutils";
import { AwsServiceClient } from "../src";

const harness = new BaseStitchRNIntTestHarness();

const awsAccessKeyIdEnvVar = "TEST_STITCH_AWS_ACCESS_KEY_ID";
const awsSecretAccessKeyEnvVar = "TEST_STITCH_AWS_SECRET_ACCESS_KEY";

const awsAccessKeyId: string | undefined = (() =>
  process.env[awsAccessKeyIdEnvVar])();

const awsSecretAccessKey: string | undefined = (() =>
  process.env[awsSecretAccessKeyEnvVar])();

beforeAll(() => harness.setup());
afterAll(() => harness.teardown());

const test = awsAccessKeyId && awsSecretAccessKey ? it : it.skip;

describe("AwsServiceClient", () => {
  test("should put object", async () => {
    const [appResponse, app] = await harness.createApp();
    await harness.addProvider(app as App, new Anon());
    const [svcResponse, svc] = await harness.addService(
      app as App,
      "aws",
      new Aws("aws1", {
        accessKeyId: awsAccessKeyId!,
        secretAccessKey: awsSecretAccessKey!
      })
    );
    await harness.addRule(
      svc as Service,
      new AwsRuleCreator("default", ["s3:PutObject"])
    );

    const client = await harness.getAppClient(appResponse as AppResponse);
    await client.auth.loginWithCredential(new AnonymousCredential());

    const awsS3 = client.getServiceClient(AwsServiceClient.factory, "aws1");

    // Putting to an bad bucket should fail
    const bucket = "notmystuff";
    const key = new BSON.ObjectID().toHexString();
    const acl = "public-read";
    const contentType = "plain/text";
    const body = "hello again friend; did you miss me";
    const args = {
      ACL: acl,
      Body: body,
      Bucket: bucket,
      ContentType: contentType,
      Key: key,
    };

    try {
      await awsS3.execute(
        new AwsRequest.Builder()
          .withService("s3")
          .withAction("PutObject")
          .withArgs(args)
          .build()
      );
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError).toBeTruthy();
      expect(error.errorCode).toEqual(StitchServiceErrorCode.AWSError);
    }

    // Putting with all good params for S3 should work
    const bucketGood = "stitch-test-sdkfiles";
    const transport = new FetchTransport();
    args.Bucket = bucketGood;

    let result = await awsS3.execute(
      new AwsRequest.Builder()
        .withService("s3")
        .withAction("PutObject")
        .withArgs(args)
        .build()
    );
    let location = `https://stitch-test-sdkfiles.s3.amazonaws.com/${key}`;
    expect(result.ETag).toBeDefined();

    let httpResult = await transport.roundTrip({
      method: Method.GET,
      url: location
    } as any);
    expect(httpResult.body).toEqual(body);


    // With a binary body
    const bodyBin = new BSON.Binary(new Buffer(body));
    args.Body = bodyBin;

    result = await awsS3.execute(
      new AwsRequest.Builder()
        .withService("s3")
        .withAction("PutObject")
        .withArgs(args)
        .build()
    );
    location = `https://stitch-test-sdkfiles.s3.amazonaws.com/${key}`;
    expect(result.ETag).toBeDefined();

    httpResult = await transport.roundTrip({
      method: Method.GET,
      url: location
    } as any);
    expect(httpResult.body).toEqual(body);

    // With a Uint8Array body

    /** @see: https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String */
    function str2ab(str): Uint8Array {
      const buf = new ArrayBuffer(str.length); // 2 bytes for each char
      const bufView = new Uint8Array(buf);
      for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return bufView;
    }

    const bodyInput = str2ab(body);
    args.Body = BSON.Binary(new Buffer(bodyInput));
    result = await awsS3.execute(
      new AwsRequest.Builder()
        .withService("s3")
        .withAction("PutObject")
        .withArgs(args)
        .build()
    );
    location = `https://stitch-test-sdkfiles.s3.amazonaws.com/${key}`;
    expect(result.ETag).toBeDefined();

    httpResult = await transport.roundTrip({
      method: Method.GET,
      url: location
    } as any);
    expect(httpResult.body).toEqual(body);
  });
});
