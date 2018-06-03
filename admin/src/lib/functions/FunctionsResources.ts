import { Codec } from "stitch-core";

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
      source: from[FunctionCreatorFields.Source],
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
