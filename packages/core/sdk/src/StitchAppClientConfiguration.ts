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

import { StitchClientConfiguration } from "./StitchClientConfiguration";

export class StitchAppClientConfiguration extends StitchClientConfiguration {
  public readonly clientAppId: string;
  public readonly localAppName: string;
  public readonly localAppVersion: string;

  public constructor(
    config: StitchClientConfiguration,
    clientAppId: string,
    localAppName: string,
    localAppVersion: string
  ) {
    super(
      config.baseURL,
      config.storage,
      config.dataDirectory,
      config.transport
    );
    this.clientAppId = clientAppId;
    this.localAppVersion = localAppVersion;
    this.localAppName = localAppName;
  }

  public builder(): StitchAppClientConfiguration.Builder {
    return new StitchAppClientConfiguration.Builder(this);
  }
}

/* tslint:disable:no-namespace max-classes-per-file */
export namespace StitchAppClientConfiguration {
  export class Builder extends StitchClientConfiguration.Builder {
    public static forApp(clientAppId: string, baseURL?: string) {
      const builder = new Builder().withClientAppId(clientAppId);
      if (baseURL) {
        builder.withBaseURL(baseURL);
      }
      return builder;
    }

    public clientAppId: string;
    public localAppName: string;
    public localAppVersion: string;

    public constructor(config?: StitchAppClientConfiguration) {
      super(config);
      if (config) {
        this.clientAppId = config.clientAppId;
        this.localAppVersion = config.localAppVersion;
        this.localAppName = config.localAppName;
      }
    }

    public withClientAppId(clientAppId: string): this {
      this.clientAppId = clientAppId;
      return this;
    }

    public withLocalAppName(localAppName: string): this {
      this.localAppName = localAppName;
      return this;
    }

    public withLocalAppVersion(localAppVersion: string): this {
      this.localAppVersion = localAppVersion;
      return this;
    }

    public build(): StitchAppClientConfiguration {
      if (!this.clientAppId) {
        throw new Error("clientAppId must be set to a non-empty string");
      }

      const config = super.build();
      return new StitchAppClientConfiguration(
        config,
        this.clientAppId,
        this.localAppName,
        this.localAppVersion
      );
    }
  }
}
