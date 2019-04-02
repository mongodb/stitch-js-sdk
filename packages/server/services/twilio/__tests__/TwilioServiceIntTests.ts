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
  Service,
  Twilio,
  TwilioAction,
  TwilioConfig,
  TwilioRule,
  TwilioService
} from "mongodb-stitch-core-admin-client";
import {
  AnonymousCredential,
  StitchServiceError,
  StitchServiceErrorCode
} from "mongodb-stitch-core-sdk";
import { BaseStitchServerIntTestHarness } from "mongodb-stitch-server-testutils";
import { TwilioServiceClient } from "../src";

const harness = new BaseStitchServerIntTestHarness();

const twilioSidEnvVar = "TEST_STITCH_TWILIO_SID";
const twilioAuthEnvVar = "TEST_STITCH_TWILIO_AUTH_TOKEN";

const twilioSid: string | undefined = (() => process.env[twilioSidEnvVar])();

const twilioAuthToken: string | undefined = (() =>
  process.env[twilioAuthEnvVar])();

beforeAll(() => harness.setup());
afterAll(() => harness.teardown());

const test = twilioSid && twilioAuthToken ? it : it.skip;

describe("TwilioService", () => {
  test("should send message", async () => {
    const { app: appResponse, appResource: app } = await harness.createApp();
    await harness.addProvider(app, new Anon());
    const [svcResponse, svc] = await harness.addService(
      app,
      new TwilioService("twilio1", new TwilioConfig(
        twilioSid!,
        twilioAuthToken!
      ))
    );

    await harness.addRule(
      svc,
      new TwilioRule("default", [TwilioAction.Send])
    );

    const client = harness.getAppClient(appResponse);
    await client.auth.loginWithCredential(new AnonymousCredential());

    const twilio = client.getServiceClient(
      TwilioServiceClient.factory,
      "twilio1"
    );

    // Sending a random message to an invalid number should fail
    const to = "+15005550010";
    const from = "+15005550001";
    const body = "I've got it!";
    const mediaUrl = "https://jpegs.com/myjpeg.gif.png";

    try {
      await twilio.sendMessage(to, from, body);
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError).toBeTruthy();
      expect(error.errorCode).toEqual(StitchServiceErrorCode.TwilioError);
    }

    try {
      await twilio.sendMessage(to, from, body, mediaUrl);
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError).toBeTruthy();
      expect(error.errorCode).toEqual(StitchServiceErrorCode.TwilioError);
    }

    // Sending with all good params for Twilio should work
    const fromGood = "+15005550006";

    await twilio.sendMessage(to, fromGood, body);
    await twilio.sendMessage(to, fromGood, mediaUrl);

    // Excluding any required parameters should fail
    try {
      await twilio.sendMessage(to, "", body, mediaUrl);
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError).toBeTruthy();
      expect(error.errorCode).toEqual(StitchServiceErrorCode.InvalidParameter);
    }
  });
});
