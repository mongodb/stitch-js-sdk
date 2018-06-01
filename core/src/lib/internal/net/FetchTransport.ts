import { BasicRequest } from "./BasicRequest";
import Response from "./Response";
import Transport from "./Transport";
require("es6-promise").polyfill();
require("fetch-everywhere");

export default class FetchTransport implements Transport {
  public roundTrip(request: BasicRequest): Promise<Response> {
    const responsePromise = fetch(request.url, {
      body: request.body,
      headers: request.headers,
      method: request.method
    });

    const responseTextPromise = responsePromise.then(response =>
      response.text()
    );

    return Promise.all([responsePromise, responseTextPromise]).then(values => {
      const response = values[0];
      const body = values[1];
      const headers: { [key: string]: string } = {};
      response.headers.forEach((key, value) => {
        headers[key] = value;
      });
      return {
        body,
        headers,
        statusCode: response.status
      };
    });
  }
}
