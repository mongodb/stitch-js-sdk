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

import * as EJSON from "mongodb-extjson";
import {
  Codec,
  Encoder,
  Method,
  StitchAuthRequest,
  StitchAuthRequestClient,
} from "mongodb-stitch-core-sdk";
import { StitchAdminRoutes } from "./StitchAdminResourceRoutes";

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      derivedCtor.prototype[name] = baseCtor.prototype[name];
    });
  });
}

/// Base implementation of Resource Protocol
export class BasicResource<T extends StitchAdminRoutes> {
  public routes: T;
  public authRequestClient: StitchAuthRequestClient;

  constructor(authRequestClient: StitchAuthRequestClient, routes: T) {
    this.authRequestClient = authRequestClient;
    this.routes = routes;
  }
}

/// Adds an endpoint method that GETs some list
class Listable<T, R extends StitchAdminRoutes> extends BasicResource<R> {
  public readonly codec: Codec<T>;

  public list(): Promise<T[]> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.GET).withPath(this.routes.baseRoute);

    return this.authRequestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response =>
        EJSON.parse(response.body!).map(val => this.codec.decode(val)));
  }
}

// / Adds an endpoint method that GETs some id
class Gettable<T, R extends StitchAdminRoutes> extends BasicResource<R> {
  public readonly codec: Codec<T>;

  public get(): Promise<T> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.GET).withPath(this.routes.baseRoute);

    return this.authRequestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response =>
        this.codec.decode(EJSON.parse(response.body!)));
  }
}

// / Adds an endpoint method that DELETEs some id
class Removable<R extends StitchAdminRoutes> extends BasicResource<R> {
  public remove(): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.DELETE).withPath(this.routes.baseRoute);

    return this.authRequestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {
        return;
      });
  }
}

// / Adds an endpoint method that POSTs new data
class Creatable<Creator, T, R extends StitchAdminRoutes> extends BasicResource<R> {
  public readonly codec: Codec<T>;
  public readonly creatorCodec: Encoder<Creator>;

  public create(data: Creator): Promise<T> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.routes.baseRoute)
      .withBody(EJSON.stringify(this.creatorCodec.encode(data)));

    return this.authRequestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response =>
        this.codec.decode(EJSON.parse(response.body!)));
  }
}

// / Adds an endpoint method that PUTs some data
class Updatable<T, R extends StitchAdminRoutes> extends BasicResource<R> {
  public readonly updatableCodec: Codec<T>;

  public update(data: T): Promise<T> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.PUT)
      .withPath(this.routes.baseRoute)
      .withBody(EJSON.stringify(data));

    return this.authRequestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response =>
        this.updatableCodec.decode(EJSON.parse(response.body!))
      );
  }
}

// / Adds an endpoint that enables a given resource
class Enablable<R extends StitchAdminRoutes> extends BasicResource<R> {
  public enable(): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.PUT).withPath(`${this.routes.baseRoute}/enable`);

    return this.authRequestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {
        return;
      });
  }
}

// / Adds an endpoint that disables a given resource
class Disablable<R extends StitchAdminRoutes> extends BasicResource<R> {
  public disable(): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.PUT).withPath(`${this.routes.baseRoute}/disable`);

    return this.authRequestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {
        return;
      });
  }
}

export {
  Gettable,
  Updatable,
  Listable,
  Creatable,
  Enablable,
  Disablable,
  Removable,
};
