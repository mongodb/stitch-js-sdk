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

import { Storage } from "mongodb-stitch-core-sdk";
import { AsyncStorage } from "react-native"

const stitchPrefixKey = "__stitch.client";

/** @hidden */
export default class RNAsyncStorage implements Storage {
  constructor(private readonly suiteName: string) {}

  private cachedStorage: { [key: string]: string } = {};

  private getKey(forKey: string): string {
    return `${stitchPrefixKey}.${this.suiteName}.${forKey}`;
  }

  /**
   * Refreshes the cached storage by loading all keys and values from the 
   * asynchronous storage abstraction.
   */
  public refreshCache(): Promise<void> {
    return AsyncStorage.getAllKeys()
      .then(keys => {
        return AsyncStorage.multiGet(keys)
      })
      .then(values => {
        this.cachedStorage = {};

        values.forEach(element => {
          let key = element[0];
          let value = element[1];

          this.cachedStorage[key] = value;
        });
      })
  }

  /**
   * Gets a stored value from the cache.
   * @param key 
   */
  public get(key: string): any {
    return this.cachedStorage[this.getKey(key)];
  }

  /**
   * Saves a value to the cache, and saves the value to async storage. Does not
   * block, and completion of the async save is neither checked nor guaranteed.
   */
  public set(key: string, value: string) {
    this.cachedStorage[this.getKey(key)] = value;
    AsyncStorage.setItem(this.getKey(key), value);
  }

  /**
   * Deletes a value from the cache, and removes the value from async storage. 
   * Does not block, and completion of the async removal is neither checked nor 
   * guaranteed.
   */
  public remove(key: string) {
    delete this.cachedStorage[this.getKey(key)];
    AsyncStorage.removeItem(this.getKey(key));
  }
}
