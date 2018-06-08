import { CoreStitchServiceClient } from "stitch-core";
import { HttpMethod } from "../HttpMethod";
import { HttpRequest } from "../HttpRequest";
import HttpResponse from "../HttpResponse";
import ResultDecoders from "./ResultDecoders";

enum RequestAction {
  GetAction = "get",
  PostAction = "post",
  PutAction = "put",
  DeleteAction = "delete",
  HeadAction = "head",
  PatchAction = "patch",

  HttpUrlParam = "url",
  HttpAuthUrlParam = "authUrl",
  HttpHeadersUrlParam = "headers",
  HttpCookiesParam = "cookies",
  HttpBodyParam = "body",
  HttpEncodeBodyAsJsonParam = "encodeBodyAsJSON",
  HttpFormParam = "form",
  HttpFollowRedirectsParam = "followRedirects"
}

export default class CoreHttpServiceClient {
  public constructor(private readonly service: CoreStitchServiceClient) {
    this.service = service;
  }

  public execute(request: HttpRequest): Promise<HttpResponse> {
    let action;
    switch (request.method) {
      case HttpMethod.GET:
        action = RequestAction.GetAction;
        break;
      case HttpMethod.POST:
        action = RequestAction.PostAction;
        break;
      case HttpMethod.PUT:
        action = RequestAction.PutAction;
        break;
      case HttpMethod.DELETE:
        action = RequestAction.DeleteAction;
        break;
      case HttpMethod.HEAD:
        action = RequestAction.HeadAction;
        break;
      case HttpMethod.PATCH:
        action = RequestAction.PatchAction;
        break;
      default:
        throw new Error(`unknown method ${request.method}`);
    }

    const args = {};
    args[RequestAction.HttpUrlParam] = request.url;
    if (request.authUrl !== undefined) {
      args[RequestAction.HttpAuthUrlParam] = request.authUrl;
    }
    if (request.headers !== undefined) {
      args[RequestAction.HttpHeadersUrlParam] = request.headers;
    }
    if (request.cookies !== undefined) {
      args[RequestAction.HttpCookiesParam] = request.cookies;
    }
    if (request.body !== undefined) {
      args[RequestAction.HttpBodyParam] = request.body;
    }
    if (request.encodeBodyAsJson !== undefined) {
      args[RequestAction.HttpEncodeBodyAsJsonParam] = request.encodeBodyAsJson;
    }
    if (request.form !== undefined) {
      args[RequestAction.HttpFormParam] = request.form;
    }
    if (request.followRedirects !== undefined) {
      args[RequestAction.HttpFollowRedirectsParam] = request.followRedirects;
    }

    return this.service.callFunctionInternal(
      action,
      [args],
      ResultDecoders.HttpResponseDecoder
    );
  }
}
