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

import { Codec } from "mongodb-stitch-core-sdk";

// / For creating or updating a function of an application
enum FunctionCreatorFields {
  Name = "name",
  Source = "source",
  CanEvaluate = "can_evaluate",
  Private = "private"
}

export interface FunctionCreator {
  readonly canEvaluate?: string;
  readonly name: string;
  readonly private: boolean;
  readonly source: string;
}

export class FunctionCreatorCodec implements Codec<FunctionCreator> {
  public decode(from: object): FunctionCreator {
    return {
      canEvaluate: from[FunctionCreatorFields.CanEvaluate],
      name: from[FunctionCreatorFields.Name],
      private: from[FunctionCreatorFields.Private],
      source: from[FunctionCreatorFields.Source]
    };
  }

  public encode(from: FunctionCreator): object {
    return {
      [FunctionCreatorFields.Name]: from.name,
      [FunctionCreatorFields.Source]: from.source,
      [FunctionCreatorFields.CanEvaluate]: from.canEvaluate,
      [FunctionCreatorFields.Private]: from.private
    };
  }
}

enum FunctionResponseFields {
  Id = "id",
  Name = "name"
}

// / View of a Function of an application
export interface FunctionResponse {
  readonly id: string;
  readonly name: string;
}

export class FunctionResponseCodec implements Codec<FunctionResponse> {
  public decode(from: object): FunctionResponse {
    return {
      id: from[FunctionResponseFields.Id],
      name: from[FunctionResponseFields.Name]
    };
  }

  public encode(from: FunctionResponse): object {
    return {
      [FunctionResponseFields.Id]: from.id,
      [FunctionResponseFields.Name]: from.name
    };
  }
}
