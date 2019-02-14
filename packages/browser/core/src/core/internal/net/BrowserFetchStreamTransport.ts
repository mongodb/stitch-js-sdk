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

import {
  BasicRequest,
  EventStream,
  Headers,
  ContentTypes,
  Response,
  Transport,
  handleRequestError
} from "mongodb-stitch-core-sdk";
import BrowserFetchTransport from "./BrowserFetchTransport";
import EventSourceEventStream from "./EventSourceEventStream";
import {fetch as fetch} from 'whatwg-fetch'

/** @hidden */
export default class BrowserFetchStreamTransport extends BrowserFetchTransport {

  public stream(request: BasicRequest, open: boolean = true, retryRequest?: () => Promise<EventStream>): Promise<EventStream> {
    let headers = { ...request.headers };
    headers[Headers.ACCEPT] = ContentTypes.TEXT_EVENT_STREAM;
    headers[Headers.CONTENT_TYPE] = ContentTypes.TEXT_EVENT_STREAM;

    // Verify we can start a request with current params and potentially
    // force ourselves to refresh a token.
    return fetch(request.url + "&stitch_validate=true", {
      body: request.body,
      headers: headers,
      method: request.method,
      mode: 'cors'
    }).then(response => {
      const headers: { [key: string]: string } = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      if (response.status < 200 || response.status >= 300) {
        return response.text()
        .then(body => handleRequestError(new Response(headers, response.status, body)));
      }

      return new Promise<EventStream>((resolve, reject) => {
        new EventSourceEventStream(
          new EventSource(request.url),
          stream => resolve(stream),
          error => reject(error),
          retryRequest ? 
            () => retryRequest().then(es => es as EventSourceEventStream)
            : undefined
          );
      });
    });
  }
}
