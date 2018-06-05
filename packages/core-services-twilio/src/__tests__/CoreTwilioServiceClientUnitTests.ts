import { CoreStitchServiceClientImpl } from "stitch-core";
import { anything, capture, instance, mock, when } from "ts-mockito";
import CoreTwilioServiceClient from "../lib/CoreTwilioServiceClient";

describe("CoreTwilioServiceClientUnitTests", () => {
  it("should send message", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);

    const to = "+15558509552";
    const from = "+15558675309";
    const body = "I've got your number";

    const client = new CoreTwilioServiceClient(service);

    await client.sendMessage(to, from, body);

    const [funcName, funcArgsArg] = capture(
      serviceMock.callFunctionInternal
    ).last();

    expect(funcName).toEqual("send");
    expect((funcArgsArg as any[]).length).toBe(1);
    const expectedArgs = {
      body,
      from,
      to
    };

    expect(funcArgsArg[0]).toEqual(expectedArgs);

    // Should pass along errors
    when(serviceMock.callFunctionInternal(anything(), anything())).thenReject(
      new Error("whoops")
    );

    expect(client.sendMessage(to, from, body)).rejects.toThrow();
  });

  it("should send message with media", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);

    const to = "+15558509552";
    const from = "+15558675309";
    const body = "I've got your number";
    const mediaUrl = "https://jpegs.com/myjpeg.gif.png";

    const client = new CoreTwilioServiceClient(service);

    await client.sendMessage(to, from, body, mediaUrl);

    const [funcName, funcArgsArg] = capture(
      serviceMock.callFunctionInternal
    ).last();

    expect(funcName).toEqual("send");
    expect((funcArgsArg as any[]).length).toBe(1);
    const expectedArgs = {
      body,
      from,
      mediaUrl,
      to
    };

    expect(funcArgsArg[0]).toEqual(expectedArgs);

    // Should pass along errors
    when(serviceMock.callFunctionInternal(anything(), anything())).thenReject(
      new Error("whoops")
    );

    expect(client.sendMessage(to, from, body)).rejects.toThrow();
  });
});
