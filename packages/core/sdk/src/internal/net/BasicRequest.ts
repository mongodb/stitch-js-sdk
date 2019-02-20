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

import Method from "./Method";

/** @hidden */
export class BasicRequest {
  public readonly method: Method;
  public readonly url: string;
  public readonly headers: { [key: string]: string };
  public readonly body?: string;

  public constructor(
    method: Method,
    url: string,
    headers: { [key: string]: string },
    body?: string
  ) {
    this.method = method;
    this.url = url;
    this.headers = headers;
    this.body = body;
  }
}

/** @hidden */
export namespace BasicRequest {
  export class Builder {
    public method?: Method;
    public url?: string;
    public headers?: { [key: string]: string };
    public body?: string;

    public constructor(request?: BasicRequest) {
      if (!request) {
        return;
      }

      this.method = request.method;
      this.url = request.url;
      this.headers = request.headers;
      this.body = request.body;
    }

    public withMethod(method: Method): this {
      this.method = method;
      return this;
    }

    public withUrl(url: string): this {
      this.url = url;
      return this;
    }

    public withHeaders(headers: { [key: string]: string }): this {
      this.headers = headers;
      return this;
    }

    public withBody(body?: string): this {
      this.body = body;
      return this;
    }

    public build(): BasicRequest {
      if (this.method === undefined) {
        throw new Error("must set method");
      }
      if (this.url === undefined) {
        throw new Error("must set non-empty url");
      }
      return new BasicRequest(
        this.method,
        this.url,
        /* tslint:disable no-object-literal-type-assertion */
        this.headers === undefined
          ? ({} as { [key: string]: string })
          : this.headers,
         /* tslint:enable no-object-literal-type-assertion */
        this.body
      );
    }
  }
}
