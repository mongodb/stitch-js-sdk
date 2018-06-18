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

import { StitchRequest } from "./StitchRequest";
import Headers from "./Headers";
import ContentTypes from "./ContentTypes";
import { stringify } from "mongodb-extjson";

export class StitchDocRequest extends StitchRequest {
  public readonly document: object;

  constructor(request: StitchRequest, document: object) {
    super(
      request.method,
      request.path,
      request.headers,
      request.startedAt,
      request.body
    );

    this.document = document;
  }

  public get builder(): StitchDocRequest.Builder {
    return new StitchDocRequest.Builder(this);
  }
}

export namespace StitchDocRequest {
  export class Builder extends StitchRequest.Builder {
    public document: object;

    constructor(request?: StitchDocRequest) {
      super(request);

      if (request !== undefined) {
        this.document = request.document;
      }
    }

    public withDocument(document: object): this {
      this.document = document;
      return this;
    }

    public build(): StitchDocRequest {
      if (this.document === undefined || !(this.document instanceof Object)) {
        throw new Error("document must be set");
      }
      if (this.headers === undefined) {
        this.withHeaders({});
      }
      this.headers![Headers.CONTENT_TYPE] = ContentTypes.APPLICATION_JSON;
      this.withBody(stringify(this.document));
      return new StitchDocRequest(super.build(), this.document);
    }
  }
}
