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

import { HttpMethod } from "./HttpMethod";

/**
 * An HttpRequest encapsulates the details of an HTTP request over the HTTP service.
 */
export class HttpRequest {
  public constructor(
    public readonly url: string,
    public readonly method: HttpMethod,
    public readonly authUrl: string,
    public readonly headers: Record<string, string[]>,
    public readonly cookies: Record<string, string>,
    public readonly body: any,
    public readonly encodeBodyAsJson: boolean,
    public readonly form: Record<string, string>,
    public readonly followRedirects: boolean
  ) {}
}

export namespace HttpRequest {
  /**
   * A builder that can build {@link HttpRequest}s.
   */
  export class Builder {
    private url: string;
    private method: HttpMethod;
    private authUrl: string;
    private headers: Record<string, string[]>;
    private cookies: Record<string, string>;
    private body: object;
    private encodeBodyAsJson: boolean;
    private form: Record<string, string>;
    private followRedirects: boolean;

    /**
     * Constructs a new builder for an HTTP request.
     */
    public constructor() {/* */}

    /**
     * Sets the Url that the request will be performed against.
     *
     * @param url the Url that the request will be performed against.
     * @return the builder.
     */
    public withUrl(url: string): this {
      this.url = url;
      return this;
    }

    /**
     * Sets the HTTP method of the request.
     *
     * @param method the HTTP method of the request.
     * @return the builder.
     */
    public withMethod(method: HttpMethod): this {
      this.method = method;
      return this;
    }

    /**
     * Sets the Url that will be used to capture cookies for authentication before the
     * actual request is executed.
     *
     * @param authUrl the Url that will be used to capture cookies for authentication before the
     *                actual request is executed.
     * @return the builder.
     */
    public withAuthUrl(authUrl: string): this {
      this.authUrl = authUrl;
      return this;
    }

    /**
     * Sets the headers that will be included in the request.
     *
     * @param headers the headers that will be included in the request.
     * @return the builder.
     */
    public withHeaders(headers: Record<string, string[]>): this {
      this.headers = headers;
      return this;
    }

    /**
     * Sets the cookies that will be included in the request.
     *
     * @param cookies the cookies that will be included in the request.
     * @return the builder.
     */
    public withCookies(cookies: Record<string, string>): this {
      this.cookies = cookies;
      return this;
    }

    /**
     * Sets the body that will be included in the request. If encodeBodyAsJson is not set
     * (or is set to false) the body must either be a {@link String} or a {@link Binary} or else
     * the request will fail when executed on Stitch.
     *
     * @param body the body that will be included in the request.
     * @return the builder.
     */
    public withBody(body: any): this {
      this.body = body;
      return this;
    }

    /**
     * Sets whether or not the included body should be encoded as extended JSON when sent to the
     * url in this request. Defaults to false.
     * @see Builder#withBody withBody
     *
     * @param encodeBodyAsJson whether or not the included body should be encoded as extended JSON
     *                         when sent to the url in this request.
     * @return the builder.
     */
    public withEncodeBodyAsJson(encodeBodyAsJson: boolean): this {
      this.encodeBodyAsJson = encodeBodyAsJson;
      return this;
    }

    /**
     * Sets the form that will be included in the request.
     *
     * @param form the form that will be included in the request.
     * @return the builder.
     */
    public withForm(form: Record<string, string>): this {
      this.form = form;
      return this;
    }

    /**
     * Sets whether or not Stitch should follow redirects while executing the request. Defaults
     * to false.
     *
     * @param followRedirects whether or not Stitch should follow redirects while executing the
     *                        request. Defaults to false.
     * @return the builder.
     */
    public withFollowRedirects(followRedirects: boolean): this {
      this.followRedirects = followRedirects;
      return this;
    }

    /**
     * Builds, validates, and returns the {@link HttpRequest}.
     *
     * @return the built HTTP request.
     */
    public build(): HttpRequest {
      if (this.url === undefined || this.url === "") {
        throw new Error("must set url");
      }

      if (this.method === undefined) {
        throw new Error("must set method");
      }

      return new HttpRequest(
        this.url,
        this.method,
        this.authUrl,
        this.headers,
        this.cookies,
        this.body,
        this.encodeBodyAsJson,
        this.form,
        this.followRedirects
      );
    }
  }
}
