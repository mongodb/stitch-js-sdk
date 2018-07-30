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

import { AwsRequest } from "../src/AwsRequest"

describe("AwsRequest", () => {
  it("should build", () => {
    // Require at a minimum service and action
    expect(() => new AwsRequest.Builder().build()).toThrow();
    expect(() => 
      new AwsRequest.Builder().withService("ses").build()
    ).toThrow();
    expect(() => {
      new AwsRequest.Builder().withAction("send").build()
    }).toThrow();

    // Minimum satisfied
    const expectedService = "ses";
    const expectedAction = "send";

    const request = new AwsRequest.Builder()
      .withService(expectedService)
      .withAction(expectedAction)
      .build();

    expect(expectedService).toEqual(request.service);
    expect(expectedAction).toEqual(request.action);

    expect(request.region).toBeUndefined();
    expect(Object.keys(request.args).length).toEqual(0);
    expect(request.args.constructor).toEqual(Object);

    // Full request
    const expectedRegion = "us-east-1";
    const expectedArgs = { "hi": "hello" };
    const fullRequest = new AwsRequest.Builder()
      .withService(expectedService)
      .withAction(expectedAction)
      .withRegion(expectedRegion)
      .withArgs(expectedArgs)
      .build();

    expect(expectedService).toEqual(fullRequest.service);
    expect(expectedAction).toEqual(fullRequest.action);
    expect(expectedRegion).toEqual(fullRequest.region);
    expect(expectedArgs).toEqual(fullRequest.args);
  });
});
