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

import { Method } from "mongodb-stitch-core-sdk";
import { BasicResource } from "../Resources";
import { jsonProperty } from "../SerializeDecorator";

export class StitchFunction {
  @jsonProperty("_id", { omitEmpty: true })
  public readonly id: string;
  @jsonProperty("last_modified", { omitEmpty: true })
  public readonly lastModified?: number

  constructor(
    @jsonProperty("name")
    public name: string,
    @jsonProperty("private") 
    public isPrivate: boolean,
    @jsonProperty("source")
    public source: string,
    @jsonProperty("can_evaluate", { omitEmpty: true }) 
    public canEvaluate?: object) {
  }
}

export class FunctionResource extends BasicResource<StitchFunction> {
  public get(): Promise<StitchFunction> {
    return this._get(StitchFunction);
  }
  public update(data: StitchFunction): Promise<void> {
    return this._update(data, Method.PUT);
  }
  public remove(): Promise<void> {
    return this._remove();
  }
}

export class FunctionsResource extends BasicResource<StitchFunction> {
  public list(): Promise<StitchFunction[]> {
    return this._list(StitchFunction);
  }

  public create(data: StitchFunction): Promise<StitchFunction> {
    return this._create(data, StitchFunction);
  }

  public function(fid: string): FunctionResource {
    return new FunctionResource(this.adminAuth, `${this.url}/${fid}`);
  }
}
