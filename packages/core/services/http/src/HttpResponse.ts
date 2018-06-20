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

import HttpCookie from "./HttpCookie";

/**
 * The response to an HTTP request over the HTTP service.
 */
export default class HttpResponse {
  /**
   * Constructs a new response to an HTTP request.
   *
   * @param status the human readable status of the response.
   * @param statusCode the status code of the response.
   * @param contentLength the content length of the response.
   * @param headers the response headers.
   * @param cookies the response cookies.
   * @param body the response body.
   */
  public constructor(
    public readonly status: string,
    public readonly statusCode: number,
    public readonly contentLength: number,
    public readonly headers: Record<string, string[]>,
    public readonly cookies: Record<string, HttpCookie>,
    public readonly body: string
  ) {}
}
