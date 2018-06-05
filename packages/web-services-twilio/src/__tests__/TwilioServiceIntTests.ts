import {
  Anon,
  App,
  AppResponse,
  Service,
  Twilio,
  TwilioActions,
  TwilioConfig,
  TwilioRuleCreator
} from "stitch-admin";
import {
  AnonymousCredential,
  StitchServiceErrorCode,
  StitchServiceException
} from "stitch-core";
import BaseStitchIntTestWebHarness from "stitch-web-testutils";
import { TwilioService } from "../lib/TwilioServiceClient";

const harness = new BaseStitchIntTestWebHarness();

const twilioSidEnvVar = "TEST_STITCH_TWILIO_SID";
const twilioAuthEnvVar = "TEST_STITCH_TWILIO_AUTH_TOKEN";

const twilioSid: string | undefined = (() => {
  return process.env[twilioSidEnvVar];
})();

const twilioAuthToken: string | undefined = (() => {
  return process.env[twilioAuthEnvVar];
})();

beforeAll(() => harness.setup());
afterAll(() => harness.teardown());

const test = twilioSid && twilioAuthToken ? it : it.skip;

describe("TwilioService", () => {
  test("should send message", async () => {
    const [appResponse, app] = await harness.createApp();
    await harness.addProvider(app as App, new Anon());
    const [svcResponse, svc] = await harness.addService(
      app as App,
      "twilio",
      new Twilio("twilio1", {
        accountSid: twilioSid!,
        authToken: twilioAuthToken!
      })
    );

    await harness.addRule(
      svc as Service,
      new TwilioRuleCreator("default", [TwilioActions.Send])
    );

    const client = harness.getAppClient(appResponse as AppResponse);
    await client.auth.loginWithCredential(new AnonymousCredential());

    const twilio = client.getServiceClientWithName(
      TwilioService.Factory,
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
      expect(error instanceof StitchServiceException).toBeTruthy();
      expect(error.errorCode).toEqual(StitchServiceErrorCode.TwilioError);
    }

    try {
      await twilio.sendMessage(to, from, body, mediaUrl);
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceException).toBeTruthy();
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
      expect(error instanceof StitchServiceException).toBeTruthy();
      expect(error.errorCode).toEqual(StitchServiceErrorCode.InvalidParameter);
    }
  });
});
