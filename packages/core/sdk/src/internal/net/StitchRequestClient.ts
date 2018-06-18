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
import StitchError from "../../StitchError";
import { StitchRequestErrorCode } from "../../StitchRequestErrorCode";
import StitchRequestException from "../../StitchRequestException";
import { BasicRequest } from "./BasicRequest";
import ContentTypes from "./ContentTypes";
import Headers from "./Headers";
import Response from "./Response";
import { StitchDocRequest } from "./StitchDocRequest";
import { StitchRequest } from "./StitchRequest";
import Transport from "./Transport";

function inspectResponse(response: Response): Response {
  if (response.statusCode >= 200 && response.statusCode < 300) {
    return response;
  }

  return StitchError.handleRequestError(response);
}

export default class StitchRequestClient {
  private readonly baseURL: string;
  private readonly transport: Transport;

  public constructor(baseURL: string, transport: Transport) {
    this.baseURL = baseURL;
    this.transport = transport;
  }

  public doRequest(stitchReq: StitchRequest): Promise<Response> {
    return this.transport
      .roundTrip(this.buildRequest(stitchReq))
      .catch(error => {
        throw new StitchRequestException(
          error,
          StitchRequestErrorCode.TRANSPORT_ERROR
        );
      })
      .then(inspectResponse);
  }

  private buildRequest(stitchReq: StitchRequest): BasicRequest {
    return new BasicRequest.Builder()
      .withMethod(stitchReq.method)
      .withURL(`${this.baseURL}${stitchReq.path}`)
      .withHeaders(stitchReq.headers)
      .withBody(stitchReq.body)
      .build();
  }
}
