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

import { Decoder } from "mongodb-stitch-core-sdk";
import HttpCookie from "../HttpCookie";
import HttpResponse from "../HttpResponse";

enum Fields {
  Status = "status",
  StatusCode = "statusCode",
  ContentLength = "contentLength",
  Headers = "headers",
  Cookies = "cookies",
  Body = "body",

  CookieValue = "value",
  CookiePath = "path",
  CookieDomain = "domain",
  CookieExpires = "expires",
  CookieMaxAge = "maxAge",
  CookieSecure = "secure",
  CookieHttpOnly = "httpOnly"
}

class HttpResponseDecoder implements Decoder<HttpResponse> {
  public decode(document: object): HttpResponse {
    const status = document[Fields.Status];
    const statusCode = document[Fields.StatusCode];
    const contentLength = document[Fields.ContentLength];

    let headers;
    if (document[Fields.Headers]) {
      headers = {};
      const headersDoc = document[Fields.Headers];
      Object.keys(headersDoc).forEach(headerKey => {
        const headerValue = headersDoc[headerKey];
        const valuesArr = headerValue;
        const values = new Array(valuesArr.length);
        for (const value of valuesArr) {
          values.push(value);
        }
        headers[headerKey] = values;
      });
    } else {
      headers = undefined;
    }

    let cookies;
    if (document[Fields.Cookies]) {
      cookies = {};
      const cookiesDoc = document[Fields.Cookies];
      for (const [headerKey, headerValue] of cookiesDoc) {
        const name = headerKey;
        const cookieValues = headerValue;
        const value = cookieValues[Fields.CookieValue];

        const path = cookieValues[Fields.CookiePath] || undefined;
        const domain = cookieValues[Fields.CookieDomain] || undefined;
        const expires = cookieValues[Fields.CookieExpires] || undefined;
        const maxAge = cookieValues[Fields.CookieMaxAge] || undefined;
        const secure = cookieValues[Fields.CookieSecure] || undefined;
        const httpOnly = cookieValues[Fields.CookieHttpOnly] || undefined;

        cookies.put(
          headerKey,
          new HttpCookie(
            name,
            value,
            path,
            domain,
            expires,
            maxAge,
            secure,
            httpOnly
          )
        );
      }
    } else {
      cookies = undefined;
    }

    const body = document[Fields.Body] || "";

    return new HttpResponse(
      status,
      statusCode,
      contentLength,
      headers,
      cookies,
      body
    );
  }
}

/** @hidden */
export default class ResultDecoders {
  public static readonly HttpResponseDecoder: Decoder<
    HttpResponse
  > = new HttpResponseDecoder();
}
