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

/** @hidden */
export class StitchAuthRequest extends StitchRequest {
  public constructor(
    request: StitchRequest,
    public readonly useRefreshToken: boolean = false,
    public readonly shouldRefreshOnFailure: boolean = true
  ) {
    super(
      request.method,
      request.path,
      request.headers,
      request.startedAt,
      request.body
    );
  }

  public get builder(): StitchAuthRequest.Builder {
    return new StitchAuthRequest.Builder(this);
  }
}

/** @hidden */
export namespace StitchAuthRequest {
  export class Builder extends StitchRequest.Builder {
    public useRefreshToken: boolean;
    public shouldRefreshOnFailure: boolean;

    public constructor(request?: StitchAuthRequest) {
      super(request);
    }

    public withAccessToken(): this {
      this.useRefreshToken = false;
      return this;
    }

    public withRefreshToken(): this {
      this.useRefreshToken = true;
      return this;
    }

    public withShouldRefreshOnFailure(shouldRefreshOnFailure: boolean): this {
      this.shouldRefreshOnFailure = shouldRefreshOnFailure;
      return this;
    }

    public build(): StitchAuthRequest {
      if (this.useRefreshToken) {
        this.shouldRefreshOnFailure = false;
      }

      return new StitchAuthRequest(
        super.build(),
        this.useRefreshToken,
        this.shouldRefreshOnFailure
      );
    }
  }
}
