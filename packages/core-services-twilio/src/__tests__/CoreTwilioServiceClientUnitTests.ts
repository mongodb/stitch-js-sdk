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

  // @Test
  // public void testSendMessageWithMedia() {
  //   final CoreStitchServiceClient service = Mockito.mock(CoreStitchServiceClient.class);
  //   final CoreTwilioServiceClient client = new CoreTwilioServiceClient(service);

  //   final String to = "+15558509552";
  //   final String from = "+15558675309";
  //   final String body = "I've got it!";
  //   final String mediaUrl = "https://jpegs.com/myjpeg.gif.png";

  //   client.sendMessage(to, from, body, mediaUrl);

  //   final ArgumentCaptor<String> funcNameArg = ArgumentCaptor.forClass(String.class);
  //   final ArgumentCaptor<List> funcArgsArg = ArgumentCaptor.forClass(List.class);
  //   verify(service).callFunctionInternal(funcNameArg.capture(), funcArgsArg.capture());

  //   assertEquals("send", funcNameArg.getValue());
  //   assertEquals(1, funcArgsArg.getValue().size());
  //   final Document expectedArgs = new Document();
  //   expectedArgs.put("to", to);
  //   expectedArgs.put("from", from);
  //   expectedArgs.put("body", body);
  //   expectedArgs.put("mediaUrl", mediaUrl);
  //   assertEquals(expectedArgs, funcArgsArg.getValue().get(0));

  //   // Should pass along errors
  //   doThrow(new IllegalArgumentException("whoops"))
  //       .when(service).callFunctionInternal(any(), any());
  //   assertThrows(() -> {
  //     client.sendMessage(to, from, body);
  //     return null;
  //   }, IllegalArgumentException.class);
  // }
});
