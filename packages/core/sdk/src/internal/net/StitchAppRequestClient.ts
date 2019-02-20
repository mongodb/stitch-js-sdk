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

import AppMetadata from "./ApiAppMetadata";
import BaseStitchRequestClient from "./BaseStitchRequestClient";
import EventStream from "./EventStream";
import Method from "./Method";
import Response from "./Response";
import StitchAppRoutes from "./StitchAppRoutes";
import { StitchRequest } from "./StitchRequest";
import Transport from "./Transport";

/** @hidden */
export default class StitchAppRequestClient extends BaseStitchRequestClient {
    private readonly clientAppId : string;
    private readonly routes : StitchAppRoutes;

    private appMetadata? : AppMetadata;

    public constructor(clientAppId: string, baseUrl: string, transport: Transport) {
    super(baseUrl, transport);
    this.clientAppId = clientAppId;
    this.routes = new StitchAppRoutes(clientAppId);
  }

  public doRequest(stitchReq: StitchRequest): Promise<Response> {
    return this.initAppMetadata()
      .then(metadata => super.doRequestToURL(stitchReq, metadata.hostname));
  }

  public doStreamRequest(stitchReq: StitchRequest, open = true, retryRequest?: () => Promise<EventStream>): Promise<EventStream> {
    return this.initAppMetadata()
      .then(metadata => super.doStreamRequestToURL(stitchReq, metadata.hostname, open, retryRequest));
  }

  public async getBaseURL(): Promise<string> {
      return this.initAppMetadata().then(metadata => metadata.hostname);
  }

  private initAppMetadata(): Promise<AppMetadata> {
    if (this.appMetadata) {
      return Promise.resolve(this.appMetadata);
    }

    const request : StitchRequest = new StitchRequest.Builder()
      .withMethod(Method.GET)
      .withPath(this.routes.appMetadataRoute)
      .build();

    return super.doRequestToURL(request, this.baseUrl)
      .then(resp => {
        this.appMetadata = AppMetadata.fromJSON(EJSON.parse(resp.body));
        return this.appMetadata;
      });
  }
}

