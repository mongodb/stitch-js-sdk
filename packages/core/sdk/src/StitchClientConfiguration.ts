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

import { Storage } from "./internal/common/Storage";
import Transport from "./internal/net/Transport";

/** @hidden */
export class StitchClientConfiguration {

  /**
   * The base URL of the Stitch server that the client will communicate with.
   */
  public readonly baseUrl: string;

  /**
   * The underlying storage for persisting authentication and app state.
   */
  public readonly storage: Storage;

  /**
   * The local directory in which Stitch can store any data (e.g. embedded MongoDB data directory).
   */
  public readonly dataDirectory: string;

  /**
   * The `Transport` that the client will use to make HTTP round trips to the Stitch server.
   */
  public readonly transport: Transport;

  public constructor(
    baseUrl: string,
    storage: Storage,
    dataDirectory: string,
    transport: Transport
  ) {
    this.baseUrl = baseUrl;
    this.storage = storage;
    this.dataDirectory = dataDirectory;
    this.transport = transport;
  }

  public builder(): StitchClientConfiguration.Builder {
    return new StitchClientConfiguration.Builder(this);
  }
}

/* tslint:disable:no-namespace max-classes-per-file */
/** @hidden */
export namespace StitchClientConfiguration {
  export class Builder {
    public baseUrl: string;
    public storage: Storage;
    public dataDirectory: string;
    public transport: Transport;

    constructor(config?: StitchClientConfiguration) {
      if (config) {
        this.baseUrl = config.baseUrl;
        this.storage = config.storage;
        this.dataDirectory = config.dataDirectory;
        this.transport = config.transport;
      }
    }

    public withBaseUrl(baseUrl: string): this {
      this.baseUrl = baseUrl;
      return this;
    }

    public withStorage(storage: Storage): this {
      this.storage = storage;
      return this;
    }

    public withDataDirectory(dataDirectory: string): this {
      this.dataDirectory = dataDirectory;
      return this;
    }

    public withTransport(transport: Transport): this {
      this.transport = transport;
      return this;
    }

    public build(): StitchClientConfiguration {
      return new StitchClientConfiguration(
        this.baseUrl,
        this.storage,
        this.dataDirectory,
        this.transport
      );
    }
  }
}
