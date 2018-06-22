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

import { BasicRequest } from "../../../src/internal/net/BasicRequest";
import Method from "../../../src/internal/net/Method";

describe("BasicRequest", () => {
  it("should throw if missing Method", () => {
    const builder = new BasicRequest.Builder();
    builder.withUrl("http://localhost:8080");
    expect(() => builder.build()).toThrowError();
  });

  it("should throw if missing Url", () => {
    const builder = new BasicRequest.Builder();
    builder.withMethod(Method.GET);
    expect(() => builder.build()).toThrowError();
  });

  it("should initialize", () => {
    const method = Method.GET;
    const url = "http://localhost:8080";
    const headers = { foo: "bar" };
    const body = JSON.stringify([1, 2, 3]);

    const builder = new BasicRequest.Builder();

    builder
      .withMethod(method)
      .withUrl(url)
      .withHeaders(headers)
      .withBody(body);

    const request = builder.build();

    expect(request.body).toEqual(body);
    expect(request.headers).toEqual(headers);
    expect(request.url).toEqual(url);
    expect(request.method).toEqual(method);
  });
});
