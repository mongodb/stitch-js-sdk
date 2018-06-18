import {
  Anon,
  App,
  AppResponse,
  AwsSes,
  AwsSesActions,
  AwsSesRuleCreator,
  Service
} from "mongodb-stitch-core-admin-client";
import { StitchServiceErrorCode, StitchServiceException } from "mongodb-stitch-core-sdk";
import { AnonymousCredential } from "mongodb-stitch-browser-core";
import BaseStitchWebIntTestHarness from "mongodb-stitch-browser-testutils";
import { AwsSesService } from "../lib/AwsSesServiceClient";

const harness = new BaseStitchWebIntTestHarness();

const awsAccessKeyIdEnvVar = "TEST_STITCH_AWS_ACCESS_KEY_ID";
const awsSecretAccessKeyEnvVar = "TEST_STITCH_AWS_SECRET_ACCESS_KEY";

const awsAccessKeyId: string | undefined = (() => {
  return process.env[awsAccessKeyIdEnvVar];
})();

const awsSecretAccessKey: string | undefined = (() => {
  return process.env[awsSecretAccessKeyEnvVar];
})();

beforeAll(() => harness.setup());
afterAll(() => harness.teardown());

const test = awsAccessKeyId && awsSecretAccessKey ? it : it.skip;

describe("AwsSesService should", () => {
  test("should send message", async () => {
    const [appResponse, app] = await harness.createApp();
    await harness.addProvider(app as App, new Anon());
    const [svcResponse, svc] = await harness.addService(
      app as App,
      "aws-ses",
      new AwsSes("awsses1", {
        accessKeyId: awsAccessKeyId!,
        region: "us-east-1",
        secretAccessKey: awsSecretAccessKey!
      })
    );
    await harness.addRule(
      svc as Service,
      new AwsSesRuleCreator("default", [AwsSesActions.Send])
    );

    const client = harness.getAppClient(appResponse as AppResponse);
    await client.auth.loginWithCredential(new AnonymousCredential());

    const awsSes = client.getServiceClientWithName(
      AwsSesService.Factory,
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
      expect(error instanceof StitchServiceException);
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
      expect(error instanceof StitchServiceException);
      expect(error.errorCode).toEqual(StitchServiceErrorCode.InvalidParameter);
    }
  });
});
