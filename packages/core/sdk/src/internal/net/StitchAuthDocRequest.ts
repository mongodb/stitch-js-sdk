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

import { stringify } from "mongodb-extjson";
import ContentTypes from "./ContentTypes";
import Headers from "./Headers";
import Method from "./Method";
import { StitchAuthRequest } from "./StitchAuthRequest";
import { StitchRequest } from "./StitchRequest";

/** @hidden */
export class StitchAuthDocRequest extends StitchAuthRequest {
  public readonly document: object;
  public constructor(
    request: StitchAuthRequest | StitchRequest,
    document: object
  ) {
    request instanceof StitchAuthRequest
      ? super(request, request.useRefreshToken, request.shouldRefreshOnFailure)
      : super(request);

    this.document = document;
  }

  public get builder(): StitchAuthDocRequest.Builder {
    return new StitchAuthDocRequest.Builder(this);
  }
}

/** @hidden */
export namespace StitchAuthDocRequest {
  export class Builder extends StitchAuthRequest.Builder {
    public document: object;

    public constructor(request?: StitchAuthDocRequest) {
      super(request);

      if (request !== undefined) {
        this.document = request!.document;
        this.useRefreshToken = request!.useRefreshToken;
      }
    }

    public withDocument(document: object): this {
      this.document = document;
      return this;
    }

    public withAccessToken(): this {
      this.useRefreshToken = false;
      return this;
    }

    public build(): StitchAuthDocRequest {
      if (this.document === undefined || !(this.document instanceof Object)) {
        throw new Error("document must be set: " + this.document);
      }

      if (this.headers === undefined) {
        this.withHeaders({});
      }

      this.headers![Headers.CONTENT_TYPE] = ContentTypes.APPLICATION_JSON;

      this.withBody(stringify(this.document));
      return new StitchAuthDocRequest(super.build(), this.document);
    }
  }
}
