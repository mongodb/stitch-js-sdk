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

import { CoreStitchServiceClient, Decoder } from "mongodb-stitch-core-sdk";

/** @hidden */
export default class CoreRemoteMongoReadOperation<T> {
  private readonly collectionDecoder?: Decoder<T[]>;

  public constructor(
    private readonly command: string,
    private readonly args: object,
    private readonly service: CoreStitchServiceClient,
    decoder?: Decoder<T>
  ) {
    if (decoder) {
      this.collectionDecoder = new class implements Decoder<T[]> {
        public decode(from: any) {
          if (from instanceof Array) {
            return from.map(t => decoder.decode(t));
          }

          return [decoder.decode(from)];
        }
      }();
    }
  }

  public iterator(): Promise<Iterator<T>> {
    return this.executeRead().then((res: T[]) => res[Symbol.iterator]());
  }

  public first(): Promise<T | undefined> {
    return this.executeRead().then(res => res[0]);
  }

  public asArray(): Promise<T[]> {
    return this.executeRead();
  }

  private executeRead(): Promise<T[]> {
    return this.service.callFunction(
      this.command,
      [this.args],
      this.collectionDecoder
    );
  }
}
