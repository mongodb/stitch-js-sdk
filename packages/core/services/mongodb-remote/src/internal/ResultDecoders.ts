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
import CompactChangeEvent from "../CompactChangeEvent";
import { operationTypeFromRemote } from "../OperationType";
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

enum UpdateDescriptionFields {
  UpdatedFields = "updatedFields",
  RemovedFields = "removedFields"
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
}

enum CompactChangeEventFields {
  OperationType = "ot",
  FullDocument = "fd",
  DocumentKey = "dk",
  UpdateDescription = "ud",
  StitchDocumentVersion = "sdv",
  StitchDocumentHash = "sdh"
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

class UpdateDescriptionDecoder implements Decoder<UpdateDescription> {
  public decode(from: any): UpdateDescription {
    Assertions.keyPresent(UpdateDescriptionFields.UpdatedFields, from);
    Assertions.keyPresent(UpdateDescriptionFields.RemovedFields, from);
  
    return {
      removedFields: from[UpdateDescriptionFields.RemovedFields],
      updatedFields: from[UpdateDescriptionFields.UpdatedFields],
    };
  }
}

function decodeBaseChangeEventFields<T>(
   from: any,
   updateDescriptionField: string,
   fullDocumentField: string,
   decoder?: Decoder<T>
): { 
  updateDescription: UpdateDescription | undefined, 
  fullDocument: T | undefined 
} {
  // decode the updateDescription
  let updateDescription: UpdateDescription | undefined;
  if (updateDescriptionField in from) {
    updateDescription = ResultDecoders.updateDescriptionDecoder.decode(
      from[updateDescriptionField]
    );
  } else {
    updateDescription = undefined;
  }

  // decode the full document
  let fullDocument: T | undefined;
  if (fullDocumentField in from) {
    fullDocument = from[fullDocumentField];
    if (decoder) {
      fullDocument = decoder.decode(fullDocument);
    }
  } else {
    fullDocument = undefined;
  }

  return { updateDescription, fullDocument }
}

class ChangeEventDecoder<T> implements Decoder<ChangeEvent<T>> {
  private readonly decoder?: Decoder<T>;

  constructor(decoder?: Decoder<T>) {
    this.decoder = decoder;
  }

  public decode(from: any): ChangeEvent<T> {
    Assertions.keyPresent(ChangeEventFields.Id, from);
    Assertions.keyPresent(ChangeEventFields.OperationType, from);
    Assertions.keyPresent(ChangeEventFields.Namespace, from);
    Assertions.keyPresent(ChangeEventFields.DocumentKey, from);
    
    const nsDoc = from[ChangeEventFields.Namespace];

    const { updateDescription, fullDocument } = decodeBaseChangeEventFields(
      from,
      ChangeEventFields.UpdateDescription,
      ChangeEventFields.FullDocument,
      this.decoder
    );

    return {
      documentKey: from[ChangeEventFields.DocumentKey],
      fullDocument,
      id: from[ChangeEventFields.Id],
      namespace: {
        collection: nsDoc[ChangeEventFields.NamespaceColl],
        database: nsDoc[ChangeEventFields.NamespaceDb]
      },
      operationType: operationTypeFromRemote(
        from[ChangeEventFields.OperationType]
      ),
      updateDescription
    };
  }
}

class CompactChangeEventDecoder<T> implements Decoder<CompactChangeEvent<T>> {
  private readonly decoder?: Decoder<T>;

  constructor(decoder?: Decoder<T>) {
    this.decoder = decoder;
  }

  public decode(from: any): CompactChangeEvent<T> {
    Assertions.keyPresent(CompactChangeEventFields.OperationType, from);
    Assertions.keyPresent(CompactChangeEventFields.DocumentKey, from);
    
    const { updateDescription, fullDocument } = decodeBaseChangeEventFields(
      from,
      CompactChangeEventFields.UpdateDescription,
      CompactChangeEventFields.FullDocument,
      this.decoder
    );

    let stitchDocumentVersion: object | undefined;
    if (CompactChangeEventFields.StitchDocumentVersion in from) {
      stitchDocumentVersion = from[
        CompactChangeEventFields.StitchDocumentVersion
      ];
    } else {
      stitchDocumentVersion = undefined;
    }

    let stitchDocumentHash: number | undefined;
    if (CompactChangeEventFields.StitchDocumentHash in from) {
      stitchDocumentHash = from[
        CompactChangeEventFields.StitchDocumentHash
      ];
    } else {
      stitchDocumentHash = undefined;
    }

    return {
      documentKey: from[
        CompactChangeEventFields.DocumentKey
      ],
      fullDocument,
      operationType: operationTypeFromRemote(
        from[CompactChangeEventFields.OperationType]
      ),
      stitchDocumentHash,
      stitchDocumentVersion,
      updateDescription,
    };
  }
}

export default class ResultDecoders {
  public static remoteInsertManyResultDecoder = new RemoteInsertManyResultDecoder();
  public static remoteInsertOneResultDecoder = new RemoteInsertOneResultDecoder();
  public static remoteUpdateResultDecoder = new RemoteUpdateResultDecoder();
  public static remoteDeleteResultDecoder = new RemoteDeleteResultDecoder();
  public static updateDescriptionDecoder = new UpdateDescriptionDecoder();

  // These decoders are not instantiated here, since each decoder has its own 
  // decoder for the full document type, which may differ for each collection.
  public static ChangeEventDecoder = ChangeEventDecoder;
  public static CompactChangeEventDecoder = CompactChangeEventDecoder;
}
