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
  public decode(from: object) {
    return new RemoteInsertManyResult(
      from[RemoteInsertManyResultFields.InsertedIds]
    );
  }
}

class RemoteInsertOneResultDecoder implements Decoder<RemoteInsertOneResult> {
  public decode(from: object) {
    return {
      insertedId: from[RemoteInsertOneResultFields.InsertedId]
    };
  }
}

class RemoteUpdateResultDecoder implements Decoder<RemoteUpdateResult> {
  public decode(from: object) {
    return {
      matchedCount: from[RemoteUpdateResultFields.MatchedCount],
      modifiedCount: from[RemoteUpdateResultFields.ModifiedCount],
      upsertedId: from[RemoteUpdateResultFields.UpsertedId]
    };
  }
}

class RemoteDeleteResultDecoder implements Decoder<RemoteDeleteResult> {
  public decode(from: object) {
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
