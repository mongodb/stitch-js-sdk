import { Codec } from "mongodb-stitch-core-sdk";
import FunctionRoutes from "../internal/routes/FunctionRoutes";
import FunctionsRoutes from "../internal/routes/FunctionsRoutes";
import { applyMixins, BasicResource, Creatable, Listable } from "../Resources";
import FunctionResource from "./FunctionResource";

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
    public decode(from: any): FunctionCreator {
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
    public decode(from: any): FunctionResponse {
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

export class FunctionsResource extends BasicResource<FunctionsRoutes>
  implements
    Listable<FunctionResponse, FunctionsRoutes>,
    Creatable<FunctionCreator, FunctionResponse, FunctionsRoutes> {
  public readonly codec = new FunctionResponseCodec();
  public readonly creatorCodec = new FunctionCreatorCodec();

  public create: (data: FunctionCreator) => Promise<FunctionResponse>;
  public list: () => Promise<FunctionResponse[]>;

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
applyMixins(FunctionsResource, [Creatable, Listable]);
