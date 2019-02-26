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

import { readJsonSync, writeJSONSync } from "fs-extra"
import { MemoryStorage, Storage } from "mongodb-stitch-core-sdk";
import { join } from "path"

const DEFAULT_FILE_NAME = "data.json";

/** @hidden */
export default class FileStorage implements Storage {

  private readonly filePath: string;
  private readonly cachedStorage: { [key: string]: string } = {};

  constructor(private readonly dataPath: string) {
    this.filePath = join(dataPath, DEFAULT_FILE_NAME);
    try {
      this.cachedStorage = readJsonSync(this.filePath)      
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  public get(key: string): any {
    return this.cachedStorage[key];
  }

  public set(key: string, value: string) {
    this.cachedStorage[key] = value;
    writeJSONSync(this.filePath, this.cachedStorage)
  }

  public remove(key: string) {
    delete this.cachedStorage[key];
    writeJSONSync(this.filePath, this.cachedStorage)
  }
}
