import ApiKeyRoutes from "../internal/routes/ApiKeyRoutes";
import {
  applyMixins,
  BasicResource,
  Gettable,
  Removable,
  Updatable
} from "../Resources";
import {
  ApiKeyCreator,
  ApiKeyCreatorCodec,
  ApiKeyResponse,
  ApiKeyResponseCodec
} from "./ApiKeysResource";

export default class ApiKeyResource extends BasicResource<ApiKeyRoutes>
  implements
    Gettable<ApiKeyResponse, ApiKeyRoutes>,
    Updatable<ApiKeyCreator, ApiKeyRoutes>,
    Removable<ApiKeyRoutes> {
  public readonly codec = new ApiKeyResponseCodec();
  public readonly updatableCodec = new ApiKeyCreatorCodec();

  public get: () => Promise<ApiKeyResponse>;
  public update: (data: ApiKeyCreator) => Promise<ApiKeyCreator>;
  public remove: () => Promise<void>;
}
applyMixins(ApiKeyResource, [Gettable, Updatable, Removable]);
