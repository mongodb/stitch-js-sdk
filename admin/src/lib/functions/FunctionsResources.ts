import { Codec } from "stitch-core";

// / For creating or updating a function of an application
enum FunctionCreatorFields {
  Name = "name",
  Source = "source",
  CanEvaluate = "can_evaluate",
  Private = "private"
}

export interface FunctionCreator {
  readonly name: string;
  readonly source: string;
  readonly canEvaluate?: string;
  readonly private: boolean;
}

export class FunctionCreatorCodec implements Codec<FunctionCreator> {
  decode(from: object): FunctionCreator {
    return {
      name: from[FunctionCreatorFields.Name],
      source: from[FunctionCreatorFields.Source],
      canEvaluate: from[FunctionCreatorFields.CanEvaluate],
      private: from[FunctionCreatorFields.Private]
    };
  }

  encode(from: FunctionCreator): object {
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
  decode(from: object): FunctionResponse {
    return {
      id: from[FunctionResponseFields.Id],
      name: from[FunctionResponseFields.Name]
    };
  }

  encode(from: FunctionResponse): object {
    return {
      [FunctionResponseFields.Id]: from.id,
      [FunctionResponseFields.Name]: from.name
    };
  }
}
