import { Codec } from "mongodb-stitch-core-sdk";
import ApiKeyRoutes from "../internal/routes/ApiKeyRoutes";
import ApiKeysRoutes from "../internal/routes/ApiKeysRoutes";
import { applyMixins, BasicResource, Creatable, Listable } from "../Resources";
import ApiKeyResource from "./ApiKeyResource";

// / For creating or updating a function of an application
enum ApiKeyCreatorFields {
    Name = "name",
}
  
export interface ApiKeyCreator {
    readonly name: string;
}
  
export class ApiKeyCreatorCodec implements Codec<ApiKeyCreator> {
    public decode(from: any): ApiKeyCreator {
        return {
            name: from[ApiKeyCreatorFields.Name]
        };
    }

    public encode(from: ApiKeyCreator): object {
        return {
            [ApiKeyCreatorFields.Name]: from.name,
        };
    }
}
  
enum ApiKeyResponseFields {
    Id = "_id",
    Key = "key",
    Name = "name",
    Disabled = "disabled"
}
  
  // / View of a ApiKey of an application
  export interface ApiKeyResponse {
    readonly id: string;
    readonly name: string;
    readonly disabled: boolean;
    readonly key: string;
  }
  
  export class ApiKeyResponseCodec implements Codec<ApiKeyResponse> {
    public decode(from: any): ApiKeyResponse {
      return {
          disabled: from[ApiKeyResponseFields.Disabled],
          id: from[ApiKeyResponseFields.Id],
          key: from[ApiKeyResponseFields.Key],
            name: from[ApiKeyResponseFields.Name],
      };
    }
  
    public encode(from: ApiKeyResponse): object {
      return {
        [ApiKeyResponseFields.Id]: from.id,
        [ApiKeyResponseFields.Name]: from.name,
        [ApiKeyResponseFields.Disabled]: from.disabled,
        [ApiKeyResponseFields.Key]: from.key,
      };
    }
}

export class ApiKeysResource extends BasicResource<ApiKeysRoutes>
  implements
    Listable<ApiKeyResponse, ApiKeysRoutes>,
    Creatable<ApiKeyCreator, ApiKeyResponse, ApiKeysRoutes> {
  public readonly codec = new ApiKeyResponseCodec();
  public readonly creatorCodec = new ApiKeyCreatorCodec();

  public create: (data: ApiKeyCreator) => Promise<ApiKeyResponse>;
  public list: () => Promise<ApiKeyResponse[]>;

  // TSLint has an issue that the name of our class is ApiKey
  /* tslint:disable */
  public function(fid: string): ApiKeyResource {
    return new ApiKeyResource(
        this.authRequestClient,
        new ApiKeyRoutes(this.routes, fid)
    );
  }
  /* tslint:enable */
}
applyMixins(ApiKeysResource, [Creatable, Listable]);
