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


/**
 * Represents a RFC 6265 cookie.
 */
export default class HttpCookie {
  /**
   * Constructs a new fully specified cookie.
   *
   * @param name the name of the cookie.
   * @param value the value of the cookie.
   * @param path the path within the domain to which this cookie belongs.
   * @param domain the domain to which this cookie belongs.
   * @param expires when the cookie expires.
   * @param maxAge how long the cookie can live for.
   * @param secure whether or not this cookie can only be sent to HTTPS servers.
   * @param httpOnly whether or not this cookie can only be read by a server.
   */
  public constructor(
    public readonly name: string,
    public readonly value: string,
    public readonly path?: string,
    public readonly domain?: string,
    public readonly expires?: string,
    public readonly maxAge?: number,
    public readonly secure?: boolean,
    public readonly httpOnly?: boolean
  ) {}
}
