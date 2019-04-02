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
  Anon,
  App,
  AppResource,
  AwsSesAction,
  AwsSesRule,
  AwsSesService,
  Service
} from "mongodb-stitch-core-admin-client";
import {
  StitchServiceError,
  StitchServiceErrorCode
} from "mongodb-stitch-core-sdk";
import { AnonymousCredential } from "mongodb-stitch-react-native-core";
import { BaseStitchRNIntTestHarness } from "mongodb-stitch-react-native-testutils";
import { AwsSesServiceClient } from "../src";

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

describe("AwsSesService should", () => {
  test("should send message", async () => {
    const { app: appResponse, appResource: app } = await harness.createApp();
    await harness.addProvider(app, new Anon());
    const [svcResponse, svc] = await harness.addService(
      app,
      new AwsSesService("awsses1", {
        accessKeyId: awsAccessKeyId!,
        region: "us-east-1",
        secretAccessKey: awsSecretAccessKey!
      })
    );
    await harness.addRule(
      svc,
      new AwsSesRule("default", [AwsSesAction.Send])
    );

    const client = await harness.getAppClient(appResponse);
    await client.auth.loginWithCredential(new AnonymousCredential());

    const awsSes = client.getServiceClient(
      AwsSesServiceClient.factory,
      "awsses1"
    );

    // Sending a random email to an invalid email should fail
    const to = "eliot@stitch-dev.10gen.cc";
    const from = "dwight@10gen";
    const subject = "Hello";
    const body = "again friend";

    try {
      await awsSes.sendEmail(to, from, subject, body);
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError);
      expect(error.errorCode).toEqual(StitchServiceErrorCode.AWSError);
    }

    // Sending with all good params for SES should work
    const fromGood = "dwight@baas-dev.10gen.cc";

    const result = await awsSes.sendEmail(to, fromGood, subject, body);
    expect(result.messageId).toBeDefined();

    // Excluding any required parameters should fail
    try {
      await awsSes.sendEmail(to, "", subject, body);
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError);
      expect(error.errorCode).toEqual(StitchServiceErrorCode.InvalidParameter);
    }
  });
});
