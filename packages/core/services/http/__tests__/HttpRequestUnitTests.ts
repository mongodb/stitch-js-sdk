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

import { HttpMethod, HttpRequest } from "../src";

describe("HttpRequest", () => {
  it("should build", () => {
    // Require at a minimum url and method
    expect(() => new HttpRequest.Builder().build()).toThrow();
    expect(() =>
      new HttpRequest.Builder().withUrl("http://aol.com").build()
    ).toThrow();
    expect(() =>
      new HttpRequest.Builder().withMethod(HttpMethod.GET).build()
    ).toThrow();

    // Minimum satisfied
    const expectedUrl = "http://aol.com";
    const expectedMethod = HttpMethod.DELETE;
    const request = new HttpRequest.Builder()
      .withUrl(expectedUrl)
      .withMethod(expectedMethod)
      .build();
    expect(expectedUrl).toEqual(request.url);
    expect(expectedMethod).toEqual(request.method);
    expect(request.authUrl).toBeUndefined();
    expect(request.body).toBeUndefined();
    expect(request.cookies).toBeUndefined();
    expect(request.encodeBodyAsJson).toBeUndefined();
    expect(request.followRedirects).toBeUndefined();
    expect(request.form).toBeUndefined();
    expect(request.headers).toBeUndefined();

    const expectedAuthUrl = "https://username@password:woo.com";
    const expectedBody = "hello world!";
    const expectedCookies = {};
    const expectedForm = {};
    const expectedHeaders = {};
    const fullRequest = new HttpRequest.Builder()
      .withUrl(expectedUrl)
      .withAuthUrl(expectedAuthUrl)
      .withMethod(expectedMethod)
      .withBody(expectedBody)
      .withCookies(expectedCookies)
      .withEncodeBodyAsJson(false)
      .withFollowRedirects(true)
      .withForm(expectedForm)
      .withHeaders(expectedHeaders)
      .build();
    expect(expectedUrl).toEqual(fullRequest.url);
    expect(expectedMethod).toEqual(fullRequest.method);
    expect(expectedAuthUrl).toEqual(fullRequest.authUrl);
    expect(expectedBody).toEqual(fullRequest.body);
    expect(expectedCookies).toEqual(fullRequest.cookies);
    expect(false).toEqual(fullRequest.encodeBodyAsJson);
    expect(true).toEqual(fullRequest.followRedirects);
    expect(expectedForm).toEqual(fullRequest.form);
    expect(expectedHeaders).toEqual(fullRequest.headers);
  });
});
