import StitchError from "../../StitchError";
import { BasicRequest } from "./BasicRequest";
import ContentTypes from "./ContentTypes";
import Headers from "./Headers";
import Response from "./Response";
import { StitchDocRequest } from "./StitchDocRequest";
import { StitchRequest } from "./StitchRequest";
import Transport from "./Transport";
import * as EJSON from "mongodb-extjson";
import StitchRequestException from "../../StitchRequestException";
import { StitchRequestErrorCode } from "../../StitchRequestErrorCode";

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
          throw new StitchRequestException(error, StitchRequestErrorCode.TRANSPORT_ERROR);
      })
      .then(inspectResponse);
  }

  public doJSONRequestRaw(stitchReq: StitchDocRequest): Promise<Response> {
    const newReqBuilder = stitchReq.builder;

    let encoded;
    try {
      encoded = EJSON.stringify(stitchReq.document)
    } catch (error) {
      return Promise.reject(new StitchRequestException(error, StitchRequestErrorCode.ENCODING_ERROR))
    }
    
    newReqBuilder.withBody(encoded);
    const newHeaders = newReqBuilder.headers || {}; // This is not a copy
    newHeaders[Headers.CONTENT_TYPE] = ContentTypes.APPLICATION_JSON;
    newReqBuilder.withHeaders(newHeaders);

    return this.doRequest(newReqBuilder.build());
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
