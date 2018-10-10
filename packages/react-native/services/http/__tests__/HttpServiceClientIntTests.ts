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

import { EJSON } from "bson";
import {
  Anon,
  App,
  AppResponse,
  Http,
  HttpActions,
  HttpRuleCreator,
  Service
} from "mongodb-stitch-core-admin-client";
import {
  StitchServiceError,
  StitchServiceErrorCode
} from "mongodb-stitch-core-sdk";
import { HttpMethod, HttpRequest } from "mongodb-stitch-core-services-http";
import { AnonymousCredential } from "mongodb-stitch-react-native-core";
import { BaseStitchRNIntTestHarness } from "mongodb-stitch-react-native-testutils";
import { HttpServiceClient } from "../src/HttpServiceClient";

const harness = new BaseStitchRNIntTestHarness();

beforeAll(() => harness.setup());
afterAll(() => harness.teardown());

describe("HttpServiceClient", () => {
  it("should execute", async () => {
    const [appResponse, app] = await harness.createApp();
    await harness.addProvider(app as App, new Anon());
    const [svcResponse, svc] = await harness.addService(
      app as App,
      "http",
      new Http("http1")
    );

    await harness.addRule(
      svc as Service,
      new HttpRuleCreator("default", [HttpActions.Delete])
    );

    const client = await harness.getAppClient(appResponse as AppResponse);
    await client.auth.loginWithCredential(new AnonymousCredential());

    const httpClient = client.getServiceClient(
      HttpServiceClient.factory,
      "http1"
    );

    // Specifying a request with form and body should fail
    let badUrl = "http:/aol.com";
    const method = HttpMethod.DELETE;
    const body = "hello world!";
    const cookies = {};
    cookies.bob = "barker";
    const form = {};
    const headers = {};
    headers.myHeader = ["value1", "value2"];

    let badRequest = new HttpRequest.Builder()
      .withUrl(badUrl)
      .withMethod(method)
      .withBody(body)
      .withCookies(cookies)
      .withForm(form)
      .withHeaders(headers)
      .build();

    try {
      await httpClient.execute(badRequest);
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError).toBeTruthy();
      expect(error.errorCode).toEqual(StitchServiceErrorCode.InvalidParameter);
    }

    // Executing a request against a bad domain should fail
    badUrl = "http://127.0.0.1:234";

    badRequest = new HttpRequest.Builder()
      .withUrl(badUrl)
      .withMethod(method)
      .withBody(body)
      .withCookies(cookies)
      .withHeaders(headers)
      .build();

    try {
      await httpClient.execute(badRequest);
      fail();
    } catch (error) {
      expect(error instanceof StitchServiceError).toBeTruthy();
      expect(error.errorCode).toEqual(StitchServiceErrorCode.HTTPError);
    }

    const retryAttempts = 3;
    for (let i = 1; i <= retryAttempts; i++) {
      // A correctly specific request should succeed
      const goodRequest = new HttpRequest.Builder()
        .withUrl("https://httpbin.org/delete")
        .withMethod(method)
        .withBody(body)
        .withCookies(cookies)
        .withHeaders(headers)
        .build();

      const response = await httpClient.execute(goodRequest);

      if (i !== retryAttempts && response.statusCode !== 200) {
        await sleep(5000);
        continue;
      }

      expect("200 OK").toEqual(response.status);
      expect(200).toEqual(response.statusCode);
      expect(response.contentLength).toBeGreaterThanOrEqual(300);
      expect(response.contentLength).toBeLessThanOrEqual(500);
      expect(response.body).toBeDefined();
      const dataDoc = EJSON.parse(String(response.body!!), { relaxed: true });
      expect(body).toEqual(dataDoc.data);
      const headersDoc = dataDoc.headers;
      expect("value1,value2").toEqual(headersDoc.Myheader);
      expect("bob=barker").toEqual(headersDoc.Cookie);
    }
  });
});

// Sourced from https://stackoverflow.com/a/41957152
function sleep(ms) {
  return new Promise( resolve => {
    setTimeout(resolve, ms)
  });
}
