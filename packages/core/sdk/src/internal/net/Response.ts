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


export default class Response {
  public readonly headers: { [key: string]: string } = {};

  constructor(
    headers: { [key: string]: string },
    public readonly statusCode: number,
    public readonly body?: string
  ) {
    // preprocess headers
    Object.keys(headers).map((key, index) => {
      this.headers[key.toLocaleLowerCase()] = headers[key];
    });
  }
}
