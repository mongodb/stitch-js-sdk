import { Codec } from "mongodb-stitch-core-sdk";
import FunctionRoutes from "../internal/routes/FunctionRoutes";
import FunctionsRoutes from "../internal/routes/FunctionsRoutes";
import { applyMixins, BasicResource, Creatable, Listable, Updatable, Gettable } from "../Resources";
import FunctionResource from "./FunctionResource";

// / For creating or updating a function of an application
enum FunctionFields {
  Id = "id",
    Name = "name",
    Source = "source",
    CanEvaluate = "can_evaluate",
    Private = "private"
}
  
  export interface FunctionCreator {
    readonly canEvaluate: boolean;
    readonly name: string;
    readonly private: boolean;
    readonly source: string;
  }
  
  export class FunctionCreatorCodec implements Codec<FunctionCreator> {
    public decode(from: any): FunctionCreator {
      return {
        canEvaluate: from[FunctionFields.CanEvaluate],
        name: from[FunctionFields.Name],
        private: from[FunctionFields.Private],
        source: from[FunctionFields.Source]
      };
    }
  
    public encode(from: FunctionCreator): object {
      return {
        [FunctionFields.Name]: from.name,
        [FunctionFields.Source]: from.source,
        [FunctionFields.CanEvaluate]: from.canEvaluate,
        [FunctionFields.Private]: from.private
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
    readonly canEvaluate?: boolean;
    readonly private: boolean;
    readonly source: string;
  }
  
  export class FunctionResponseCodec implements Codec<FunctionResponse> {
    public decode(from: any): FunctionResponse {
      return {
        canEvaluate: from[FunctionFields.CanEvaluate],
        id: from[FunctionFields.Id],
        name: from[FunctionFields.Name],
        private: from[FunctionFields.Private],
        source: from[FunctionFields.Source]
      };
    }
  
    public encode(from: FunctionResponse): object {
      return {
        [FunctionResponseFields.Id]: from.id,
        [FunctionResponseFields.Name]: from.name,
        [FunctionFields.Source]: from.source,
        [FunctionFields.CanEvaluate]: from.canEvaluate,
        [FunctionFields.Private]: from.private
      };
    }
}

export class FunctionsResource extends BasicResource<FunctionsRoutes>
  implements
    Listable<FunctionResponse, FunctionsRoutes>,
    Creatable<FunctionCreator, FunctionResponse, FunctionsRoutes>,
    Gettable<FunctionResponse, FunctionsRoutes>,
    Updatable<FunctionCreator, FunctionsRoutes> {
  public readonly codec = new FunctionResponseCodec();
  public readonly creatorCodec = new FunctionCreatorCodec();
  public readonly updatableCodec = new FunctionCreatorCodec();

  public create: (data: FunctionCreator) => Promise<FunctionResponse>;
  public list: () => Promise<FunctionResponse[]>;
  public update: (data: FunctionCreator) => Promise<FunctionCreator>;
    public get: () => Promise<FunctionResponse>;

  // TSLint has an issue that the name of our class is Function
  /* tslint:disable */
  public function(fid: string): FunctionResource {
    return new FunctionResource(
        this.authRequestClient,
        new FunctionRoutes(this.routes, fid)
    );
  }
  /* tslint:enable */
}
applyMixins(FunctionsResource, [Creatable, Listable, Updatable, Gettable]);
