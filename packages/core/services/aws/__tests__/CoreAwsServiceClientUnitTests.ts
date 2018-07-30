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
import { anything, capture, instance, mock, verify, when } from "ts-mockito";
import CoreAwsServiceClient from "../src/internal/CoreAwsServiceClient";
import { AwsRequest } from "../src/AwsRequest";

describe("CoreAwsServiceClient", () => {
  it("should execute", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);
    const client = new CoreAwsServiceClient(service);

    const expectedService = "ses";
    const expectedAction = "send";
    const expectedRegion = "us-east-1";
    const expectedArgs = { "hi": "hello" };

    const request = new AwsRequest.Builder()
      .withService(expectedService)
      .withAction(expectedAction)
      .withRegion(expectedRegion)
      .withArgs(expectedArgs)
      .build();

    const response = { "email": "sent" };

    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenResolve(response);

    const result = await client.execute(request);

    expect(result).toEqual(response);

    const [funcNameArg, funcArgsArg, decoderArg]: any[] = capture(
      serviceMock.callFunction
    ).last();


    expect("execute").toEqual(funcNameArg);
    expect(1).toEqual(funcArgsArg.length);
    const expectedServiceArgs = {
      "aws_service": expectedService,
      "aws_action": expectedAction,
      "aws_region": expectedRegion,
      "aws_arguments": expectedArgs
    };
    expect(expectedServiceArgs).toEqual(funcArgsArg[0]);
    expect(decoderArg).toBeUndefined();

    const request2 = new AwsRequest.Builder()
      .withService(expectedService)
      .withAction(expectedAction)
      .build();

    const result2 = await client.execute(request2);
    expect(result2).toEqual(response);

    verify(
      serviceMock.callFunction(anything(), anything(), anything())
    ).times(2);

    const [funcNameArg2, funcArgsArg2, decoderArg2]: any[] = capture(
      serviceMock.callFunction
    ).last();

    expect("execute").toEqual(funcNameArg);
    expect(1).toEqual(funcArgsArg.length);
    const expectedServiceArgs2 = {
      "aws_service": expectedService,
      "aws_action": expectedAction,
      "aws_arguments": { }
    };
    expect(expectedServiceArgs2).toEqual(funcArgsArg2[0]);
    expect(decoderArg2).toBeUndefined();
    
    // Should pass along errors
    when(
      serviceMock.callFunction(anything(), anything(), anything())
    ).thenThrow(new Error("whoops"));

    try {
      await client.execute(request);
      fail();
    } catch (_) {
      // Do nothing
    }
  });
});