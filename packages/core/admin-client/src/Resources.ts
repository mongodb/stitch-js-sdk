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
  Method,
  Response,
  StitchAuthRequest,
  StitchServiceError, 
  StitchServiceErrorCode
} from "mongodb-stitch-core-sdk";
import { deserialize, serialize, Type } from "./JsonMapper";
import StitchAdminAuth from "./StitchAdminAuth";

// Any endpoint that can be described with basic
// CRUD operations
abstract class BasicResource<T> {
  constructor(
    protected readonly adminAuth: StitchAdminAuth, 
    protected readonly url: string) {
    this.adminAuth = adminAuth;
    this.url = url;
  }

  protected _create<U>(data: U, type: Type<U>): Promise<U> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.url)
      .withBody(EJSON.stringify(serialize(data), { relaxed: false }));
    return this.adminAuth
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response => 
        deserialize(EJSON.parse(response.body!), type)
      );
  }

  protected _list(type: Type<T>): Promise<T[]> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.GET).withPath(this.url);

    return this.adminAuth
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response =>
        EJSON.parse(response.body!).map(val => deserialize(val, type))
      );
  }

  protected _get(type: Type<T>): Promise<T> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.GET).withPath(this.url);

    return this.adminAuth
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response =>
        deserialize(EJSON.parse(response.body!), type)
      );
  }

  protected _remove(): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.DELETE).withPath(this.url);

    return this.adminAuth
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {
        return;
      });
  }

  protected _update(data: T, putOrPatch: Method.PATCH | Method.PUT): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(putOrPatch)
      .withPath(this.url)
      .withBody(EJSON.stringify(serialize(data), { relaxed: false }));

    return this.adminAuth
      .doAuthenticatedRequest(reqBuilder.build())
      .then((response) => {
        return; 
      });
  }

  protected _enable(): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.PUT).withPath(`${this.url}/enable`);

    return this.adminAuth
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {
        return;
      });
  }

  protected _disable(): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.PUT).withPath(`${this.url}/disable`);

    return this.adminAuth
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {
        return;
      });
  }
}

/**
 * Throws an error if the provided `Response` has an empty body.
 */
function checkEmpty(response: Response) {
  if (response.body === undefined) {
    throw new StitchServiceError(
      "unexpected empty response",
      StitchServiceErrorCode.Unknown
    );
  }
}

export {
  BasicResource,
  checkEmpty
};
