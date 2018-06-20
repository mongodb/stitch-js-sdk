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

export class StitchClientConfiguration {
  public readonly baseURL: string;
  public readonly storage: Storage;
  public readonly dataDirectory: string;
  public readonly transport: Transport;

  public constructor(
    baseURL: string,
    storage: Storage,
    dataDirectory: string,
    transport: Transport
  ) {
    this.baseURL = baseURL;
    this.storage = storage;
    this.dataDirectory = dataDirectory;
    this.transport = transport;
  }

  public builder(): StitchClientConfiguration.Builder {
    return new StitchClientConfiguration.Builder(this);
  }
}

/* tslint:disable:no-namespace max-classes-per-file */
export namespace StitchClientConfiguration {
  export class Builder {
    public baseURL: string;
    public storage: Storage;
    public dataDirectory: string;
    public transport: Transport;

    constructor(config?: StitchClientConfiguration) {
      if (config) {
        this.baseURL = config.baseURL;
        this.storage = config.storage;
        this.dataDirectory = config.dataDirectory;
        this.transport = config.transport;
      }
    }

    public withBaseURL(baseURL: string): this {
      this.baseURL = baseURL;
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
      if (!this.baseURL) {
        throw new Error("baseURL must be set");
      }

      if (!this.storage) {
        throw new Error("storage must be set");
      }

      if (!this.transport) {
        throw new Error("transport must be set");
      }

      return new StitchClientConfiguration(
        this.baseURL,
        this.storage,
        this.dataDirectory,
        this.transport
      );
    }
  }
}
