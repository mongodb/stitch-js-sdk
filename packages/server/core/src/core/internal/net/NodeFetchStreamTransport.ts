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
  ContentTypes,
  EventStream,
  Headers,
  Response,
  Transport,
  handleRequestError
} from "mongodb-stitch-core-sdk";
import EventSourceEventStream from "./EventSourceEventStream";
import EventSource from "eventsource";
import fetch from "node-fetch";

/** @hidden */
export default class NodeFetchStreamTransport implements Transport {
  public roundTrip(request: BasicRequest): Promise<Response> {
    const responsePromise = fetch(request.url, {
      body: request.body,
      headers: request.headers,
      method: request.method,
      mode: 'cors'
    });

    const responseTextPromise = responsePromise.then(response =>
      response.text()
    );

    return Promise.all([responsePromise, responseTextPromise]).then(values => {
      const response = values[0];
      const body = values[1];
      const headers: { [key: string]: string } = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      return new Response(headers, response.status, body);
    });
  }

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
        // Any error against opening this stream here will have an error
        // telling the user to look at the network response which is why we
        // prefer the ReadableStream approach. Beyond that, this type of
        // EventStream works the same and can still reconnect.
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
