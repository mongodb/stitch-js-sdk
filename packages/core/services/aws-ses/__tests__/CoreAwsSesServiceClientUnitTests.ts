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

import { CoreStitchServiceClientImpl, Decoder } from "mongodb-stitch-core-sdk";
import {
  anyOfClass,
  anything,
  capture,
  instance,
  mock,
  when
} from "ts-mockito";
import { AwsSesSendResult, CoreAwsSesServiceClient } from "../src";

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
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenResolve(new AwsSesSendResult(expectedMessageId));

    const result = await client.sendEmail(
      toAddress,
      fromAddress,
      subject,
      body
    );
    expect(result.messageId).toEqual(expectedMessageId);

    const [funcNameArg, funcArgsArg, decoderArg]: any = capture(
      serviceMock.callFunction
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
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenThrow(new Error("whoops"));

    try {
      await client.sendEmail(toAddress, fromAddress, subject, body);
      fail();
    } catch (_) {
      // Do nothing
    }
  });
});
