import BasicRequest from "./BasicRequest";
import Response from "./Response";
import Transport from "./Transport";

export default class FetchTransport implements Transport {
  public roundTrip(request: BasicRequest): Promise<Response> {
    return fetch(request.url, {
      body: request.body,
      headers: request.headers,
      method: request.method
    }).then(response => {
      const headers: { [key: string]: string } = {};
      response.headers.forEach((key, value) => {
        headers[key] = value;
      });
      return {
        body: response.text,
        headers,
        statusCode: response.status
      };
    });
  }
}
