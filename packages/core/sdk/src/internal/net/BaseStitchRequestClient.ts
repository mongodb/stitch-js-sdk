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
import { handleRequestError } from "../../internal/common/StitchErrorUtils";
import { StitchRequestErrorCode } from "../../StitchRequestErrorCode";
import StitchError from "../../StitchError";
import StitchRequestError from "../../StitchRequestError";
import { BasicRequest } from "./BasicRequest";
import ContentTypes from "./ContentTypes";
import EventStream from "./EventStream";
import Headers from "./Headers";
import Response from "./Response";
import { StitchDocRequest } from "./StitchDocRequest";
import { StitchRequest } from "./StitchRequest";
import Transport from "./Transport";

function inspectResponse(response: Response): Response {
  if (response.statusCode >= 200 && response.statusCode < 300) {
    return response;
  }

  return handleRequestError(response);
}

/** @hidden */
export default abstract class StitchRequestClient {
  protected readonly baseUrl: string;
  protected readonly transport: Transport;

  public constructor(baseUrl: string, transport: Transport) {
    this.baseUrl = baseUrl;
    this.transport = transport;
  }

  protected doRequestToURL(stitchReq: StitchRequest, url: string): Promise<Response> {
    return this.transport
      .roundTrip(this.buildRequest(stitchReq, url))
      .catch(error => {
        throw new StitchRequestError(
          error,
          StitchRequestErrorCode.TRANSPORT_ERROR
        );
      })
      .then(inspectResponse);
  }

  protected doStreamRequestToURL(stitchReq: StitchRequest, url: string, open: boolean = true, retryRequest?: () => Promise<EventStream>): Promise<EventStream> {
    return this.transport
      .stream(this.buildRequest(stitchReq, url), open, retryRequest)
      .catch(error => {
        // Stream can throw StitchErrors itself unlike roundTrip
        if (error instanceof StitchError) {
           throw error;
        }
        throw new StitchRequestError(
          error,
          StitchRequestErrorCode.TRANSPORT_ERROR
        );
      });
  }

  private buildRequest(stitchReq: StitchRequest, url: string): BasicRequest {
    return new BasicRequest.Builder()
      .withMethod(stitchReq.method)
      .withUrl(`${url}${stitchReq.path}`)
      .withHeaders(stitchReq.headers)
      .withBody(stitchReq.body)
      .build();
  }
}
