import FunctionRoutes from "../internal/routes/FunctionRoutes";
import { applyMixins, BasicResource, Gettable, Removable, Updatable } from "../Resources";
import { FunctionCreator, FunctionCreatorCodec, FunctionResponse, FunctionResponseCodec } from "./FunctionsResource";

export default class FunctionResource extends BasicResource<FunctionRoutes>
  implements Gettable<FunctionResponse, FunctionRoutes>,
    Updatable<FunctionCreator, FunctionRoutes>, 
    Removable<FunctionRoutes> {
  public readonly codec = new FunctionResponseCodec();
  public readonly updatableCodec = new FunctionCreatorCodec();

  public get: () => Promise<FunctionResponse>;
  public update: (data: FunctionCreator) => Promise<FunctionCreator>;
  public remove: () => Promise<void>;
}
applyMixins(FunctionResource, [Gettable, Updatable, Removable]);
