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

import { Binary } from "bson";
import { CoreStitchServiceClientImpl } from "mongodb-stitch-core-sdk";
import { anything, capture, instance, mock, verify, when } from "ts-mockito";
import {
  AwsS3PutObjectResult,
  AwsS3SignPolicyResult,
  CoreAwsS3ServiceClient
} from "../src";
import ResultDecoders from "../src/internal/ResultDecoders";

describe("CoreAwsS3ServiceClient", () => {
  it("should put object", async () => {
    const serviceMock = mock(CoreStitchServiceClientImpl);
    const service = instance(serviceMock);
    const client = new CoreAwsS3ServiceClient(service);

    const bucket = "stuff";
    const key = "myFile";
    const acl = "public-read";
    const contentType = "plain/text";
    const body = "some data yo";

    const expectedLocation = "awsLocation";

    when(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenResolve(new AwsS3PutObjectResult(expectedLocation));

    let result = await client.putObject(bucket, key, acl, contentType, body);
    expect(result.location).toEqual(expectedLocation);

    const [funcNameArg, funcArgsArg, resultClassArg]: any[] = capture(
      serviceMock.callFunctionInternal
    ).last();

    expect("put").toEqual(funcNameArg);
    expect(1).toEqual(funcArgsArg.length);
    const expectedArgs: Record<string, any> = {
      acl,
      body,
      bucket,
      contentType,
      key
    };

    expect(expectedArgs).toEqual(funcArgsArg[0]);
    expect(ResultDecoders.PutObjectResultDecoder).toEqual(resultClassArg);

    const bodyBin = new Binary(new Buffer("hello"));
    result = await client.putObject(bucket, key, acl, contentType, bodyBin);
    expect(result.location).toEqual(expectedLocation);

    verify(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).times(2);
    const [funcNameArg2, funcArgsArg2, resultClassArg2]: any[] = capture(
      serviceMock.callFunctionInternal
    ).last();

    expect("put").toEqual(funcNameArg2);
    expect(1).toEqual(funcArgsArg2.length);
    expectedArgs.body = bodyBin;
    expect(expectedArgs).toEqual(funcArgsArg2[0]);
    expect(ResultDecoders.PutObjectResultDecoder).toEqual(resultClassArg2);

    const bodyBuf = new Buffer("hello");
    result = await client.putObject(bucket, key, acl, contentType, bodyBuf);
    expect(result.location).toEqual(expectedLocation);

    verify(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).times(3);
    const [funcNameArg3, funcArgsArg3, resultClassArg3]: any[] = capture(
      serviceMock.callFunctionInternal
    ).last();

    expect("put").toEqual(funcNameArg3);
    expect(1).toEqual(funcArgsArg3.length);
    expect(expectedArgs).toEqual(funcArgsArg3[0]);
    expect(ResultDecoders.PutObjectResultDecoder).toEqual(resultClassArg3);

    /** @see: https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String */
    function str2ab(str): ArrayBuffer {
      const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
      const bufView = new Uint16Array(buf);
      for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    }

    const bodyUintArray = str2ab("hello");

    result = await client.putObject(
      bucket,
      key,
      acl,
      contentType,
      bodyUintArray
    );
    expect(result.location).toEqual(expectedLocation);

    verify(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).times(4);
    const [funcNameArg4, funcArgsArg4, resultClassArg4]: any[] = capture(
      serviceMock.callFunctionInternal
    ).last();

    expect("put").toEqual(funcNameArg4);
    expect(1).toEqual(funcArgsArg4.length);
    expectedArgs.body = new Binary(new Buffer(bodyUintArray));
    expect(expectedArgs).toEqual(funcArgsArg4[0]);
    expect(ResultDecoders.PutObjectResultDecoder).toEqual(resultClassArg4);

    // Should pass along errors
    when(
      serviceMock.callFunctionInternal(anything(), anything(), anything())
    ).thenThrow(new Error("whoops"));

    try {
      await client.putObject(bucket, key, acl, contentType, body);
      fail();
    } catch (_) {
      // Do nothing
    }
  });
});
