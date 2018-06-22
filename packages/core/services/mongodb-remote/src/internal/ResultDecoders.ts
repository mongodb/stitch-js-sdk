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

import { Decoder } from "mongodb-stitch-core-sdk";
import RemoteDeleteResult from "../RemoteDeleteResult";
import RemoteInsertManyResult from "../RemoteInsertManyResult";
import RemoteInsertOneResult from "../RemoteInsertOneResult";
import RemoteUpdateResult from "../RemoteUpdateResult";

enum RemoteInsertManyResultFields {
  InsertedIds = "insertedIds"
}

enum RemoteInsertOneResultFields {
  InsertedId = "insertedId"
}

enum RemoteUpdateResultFields {
  MatchedCount = "matchedCount",
  ModifiedCount = "modifiedCount",
  UpsertedId = "upsertedId"
}

enum RemoteDeleteResultFields {
  DeletedCount = "deletedCount"
}

class RemoteInsertManyResultDecoder implements Decoder<RemoteInsertManyResult> {
  public decode(from: any) {
    return new RemoteInsertManyResult(
      from[RemoteInsertManyResultFields.InsertedIds]
    );
  }
}

class RemoteInsertOneResultDecoder implements Decoder<RemoteInsertOneResult> {
  public decode(from: any) {
    return {
      insertedId: from[RemoteInsertOneResultFields.InsertedId]
    };
  }
}

class RemoteUpdateResultDecoder implements Decoder<RemoteUpdateResult> {
  public decode(from: any) {
    return {
      matchedCount: from[RemoteUpdateResultFields.MatchedCount],
      modifiedCount: from[RemoteUpdateResultFields.ModifiedCount],
      upsertedId: from[RemoteUpdateResultFields.UpsertedId]
    };
  }
}

class RemoteDeleteResultDecoder implements Decoder<RemoteDeleteResult> {
  public decode(from: any) {
    return {
      deletedCount: from[RemoteDeleteResultFields.DeletedCount]
    };
  }
}

export default class ResultDecoders {
  public static remoteInsertManyResultDecoder = new RemoteInsertManyResultDecoder();
  public static remoteInsertOneResultDecoder = new RemoteInsertOneResultDecoder();
  public static remoteUpdateResultDecoder = new RemoteUpdateResultDecoder();
  public static remoteDeleteResultDecoder = new RemoteDeleteResultDecoder();
}
