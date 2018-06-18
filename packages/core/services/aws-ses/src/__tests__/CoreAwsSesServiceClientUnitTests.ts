import { CoreStitchServiceClientImpl, Decoder } from "mongodb-stitch-core-sdk";
import {
  anyOfClass,
  anything,
  capture,
  instance,
  mock,
  when
} from "ts-mockito";
import AwsSesSendResult from "../lib/AwsSesSendResult";
import CoreAwsSesServiceClient from "../lib/internal/CoreAwsSesServiceClient";

describe("CoreAwsSesServiceClient", () => {
  it("should send message", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);

    const client = new CoreAwsSesServiceClient(service);

    const toAddress = "eliot@10gen.com";
    const fromAddress = "dwight@10gen.com";
    const subject = "Hello";
    const body = "again friend";

    const expectedMessageId = "yourMessageId";

    when(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenResolve(new AwsSesSendResult(expectedMessageId));

    const result = await client.sendEmail(
      toAddress,
      fromAddress,
      subject,
      body
    );
    expect(result.messageId).toEqual(expectedMessageId);

    const [funcNameArg, funcArgsArg, decoderArg]: any = capture(
      serviceMock.callFunctionInternal
    ).last();

    expect(funcNameArg).toEqual("send");
    expect((funcArgsArg as any[]).length).toEqual(1);
    const expectedArgs = {
      body,
      fromAddress,
      subject,
      toAddress
    };

    expect(funcArgsArg[0]).toEqual(expectedArgs);
    expect(decoderArg).toEqual(AwsSesSendResult.Decoder);

    // Should pass along errors
    when(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenThrow(new Error("whoops"));

    try {
      await client.sendEmail(toAddress, fromAddress, subject, body);
      fail();
    } catch (_) {}
  });
});
