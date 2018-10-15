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

import { Assertions, Decoder } from "mongodb-stitch-core-sdk";
import ChangeEvent from "../ChangeEvent";
import { OperationType, operationTypeFromRemote } from "../OperationType";
import RemoteDeleteResult from "../RemoteDeleteResult";
import RemoteInsertManyResult from "../RemoteInsertManyResult";
import RemoteInsertOneResult from "../RemoteInsertOneResult";
import RemoteUpdateResult from "../RemoteUpdateResult";
import UpdateDescription from "../UpdateDescription";

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

enum ChangeEventFields {
  Id = "_id",
  OperationType = "operationType",
  FullDocument = "fullDocument",
  DocumentKey = "documentKey",
  Namespace = "ns",
  NamespaceDb = "db",
  NamespaceColl = "coll",
  UpdateDescription = "updateDescription",
  UpdateDescriptionUpdatedFields = "updatedFields",
  UpdateDescriptionRemovedFields = "removedFields"
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

class ChangeEventDecoder<T> implements Decoder<ChangeEvent<T>> {

  private readonly decoder?: Decoder<T>;

  constructor(decoder?: Decoder<T>) {
    this.decoder = decoder;
  }

  public decode(from: any) {
    Assertions.keyPresent(ChangeEventFields.Id, from);
    Assertions.keyPresent(ChangeEventFields.OperationType, from);
    Assertions.keyPresent(ChangeEventFields.Namespace, from);
    Assertions.keyPresent(ChangeEventFields.DocumentKey, from);
    
    const nsDoc = from[ChangeEventFields.Namespace];
    let updateDescription: UpdateDescription | undefined;
    if (ChangeEventFields.UpdateDescription in from) {
      const updateDescDoc = from[ChangeEventFields.UpdateDescription];
      Assertions.keyPresent(ChangeEventFields.UpdateDescriptionUpdatedFields, updateDescDoc);
      Assertions.keyPresent(ChangeEventFields.UpdateDescriptionRemovedFields, updateDescDoc);

      updateDescription = {
        removedFields: updateDescDoc[ChangeEventFields.UpdateDescriptionRemovedFields],
        updatedFields: updateDescDoc[ChangeEventFields.UpdateDescriptionUpdatedFields],
      }
    } else {
      updateDescription = undefined;
    }

    let fullDocument: T | undefined;
    if (ChangeEventFields.FullDocument in from) {
      fullDocument = from[ChangeEventFields.FullDocument];
      if (this.decoder) {
        fullDocument = this.decoder.decode(fullDocument);
      }
    } else {
      fullDocument = undefined;
    }

    return {
      documentKey: from[ChangeEventFields.DocumentKey],
      fullDocument,
      id: from[ChangeEventFields.Id],
      namespace: {
        collection: nsDoc[ChangeEventFields.NamespaceColl],
        database: nsDoc[ChangeEventFields.NamespaceDb]
      },
      operationType: operationTypeFromRemote(from[ChangeEventFields.OperationType]),
      updateDescription
    };
  }
}

export default class ResultDecoders {
  public static remoteInsertManyResultDecoder = new RemoteInsertManyResultDecoder();
  public static remoteInsertOneResultDecoder = new RemoteInsertOneResultDecoder();
  public static remoteUpdateResultDecoder = new RemoteUpdateResultDecoder();
  public static remoteDeleteResultDecoder = new RemoteDeleteResultDecoder();
  public static ChangeEventDecoder = ChangeEventDecoder;
}
