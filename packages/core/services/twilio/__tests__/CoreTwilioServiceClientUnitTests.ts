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

import { CoreStitchServiceClientImpl } from "mongodb-stitch-core-sdk";
import { anything, capture, instance, mock, when } from "ts-mockito";
import { CoreTwilioServiceClient } from "../src";

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
    when(serviceMock.callFunctionInternal(anything(), anything())).thenThrow(
      new Error("whoops")
    );

    try {
      await expect(client.sendMessage(to, from, body));
      fail();
    } catch (_) {}
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
    when(serviceMock.callFunctionInternal(anything(), anything())).thenThrow(
      new Error("whoops")
    );

    try {
      await expect(client.sendMessage(to, from, body));
      fail();
    } catch (_) {}
  });
});
