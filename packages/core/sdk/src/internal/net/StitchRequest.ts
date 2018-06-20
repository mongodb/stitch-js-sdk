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

export class StitchRequest {
  public readonly method: Method;
  public readonly path: string;
  public readonly headers: { [key: string]: string };
  public readonly body?: string;
  public readonly startedAt: number;

  public constructor(
    method: Method,
    path: string,
    headers: { [key: string]: string },
    startedAt: number,
    body?: string
  ) {
    this.method = method;
    this.path = path;
    this.headers = headers;
    this.body = body;
    this.startedAt = startedAt;
  }

  public get builder(): StitchRequest.Builder {
    return new StitchRequest.Builder(this);
  }
}

export namespace StitchRequest {
  export class Builder {
    public method?: Method;
    public path?: string;
    public headers?: { [key: string]: string };
    public body?: string;
    public startedAt?: number;

    public constructor(request?: StitchRequest) {
      if (request !== undefined) {
        this.method = request.method;
        this.path = request.path;
        this.headers = request.headers;
        this.body = request.body;
        this.startedAt = request.startedAt;
      }
    }

    public withMethod(method: Method): this {
      this.method = method;
      return this;
    }

    public withPath(path: string): this {
      this.path = path;
      return this;
    }

    public withHeaders(headers: { [key: string]: string }): this {
      this.headers = headers;
      return this;
    }

    public withBody(body: string): this {
      this.body = body;
      return this;
    }

    public build(): StitchRequest {
      if (this.method === undefined) {
        throw Error("must set method");
      }
      if (this.path === undefined) {
        throw Error("must set non-empty path");
      }
      if (this.startedAt === undefined) {
        this.startedAt = Date.now() / 1000;
      }
      return new StitchRequest(
        this.method,
        this.path,
        this.headers === undefined ? {} : this.headers,
        this.startedAt,
        this.body
      );
    }
  }
}
