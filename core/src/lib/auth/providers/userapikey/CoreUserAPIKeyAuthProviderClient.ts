import UserAPIKeyCredential from "./UserAPIKeyCredential";
import CoreAuthProviderClient from "../internal/CoreAuthProviderClient";
import { StitchAuthRequestClient, StitchAuthRoutes } from "../../..";
import { StitchAuthDocRequest } from "../../../internal/net/StitchAuthDocRequest";
import Method from "../../../internal/net/Method";
import UserAPIKey from "./models/UserAPIKey";
import { StitchAuthRequest } from "../../../internal/net/StitchAuthRequest";
import StitchRequestException from "../../../StitchRequestException";
import { StitchRequestErrorCode } from "../../../StitchRequestErrorCode";
import StitchException from "../../../StitchException";
import StitchError from "../../../StitchError";
import UserAPIKeyAuthProvider from "./UserAPIKeyAuthProvider";
import { ObjectID } from "bson";

enum ApiKeyFields {
  NAME = "name"
}

/**
 * A client for the user API key authentication provider which can be used to obtain a credential for logging in.
 */
export default abstract class CoreUserAPIKeyAuthProviderClient extends CoreAuthProviderClient<StitchAuthRequestClient>{
  protected constructor(
    requestClient: StitchAuthRequestClient,
    authRoutes: StitchAuthRoutes
  ) {
    let baseRoute = `${authRoutes.baseAuthRoute}/api_keys`
    super(UserAPIKeyAuthProvider.TYPE, requestClient, baseRoute)
  }

  /**
   * Creates a user API key that can be used to authenticate as the current user.
   * 
   * @param name the name of the API key to be created.
   */
  protected createApiKey(name: string): Promise<UserAPIKey> {
    const reqBuilder = new StitchAuthDocRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.baseRoute);
    reqBuilder
      .withDocument({
        [ApiKeyFields.NAME]: name
      })
      .withRefreshToken();
    
    return this.requestClient
      .doAuthenticatedJSONRequestRaw(reqBuilder.build())
      .then(response => {
        return UserAPIKey.readFromAPI(response.body)
      })
      .catch(err => { throw StitchError.wrapDecodingError(err) })
  }

  /**
   * Fetches a user API key associated with the current user.
   * 
   * @param keyId the id of the API key to fetch.
   */
  protected fetchApiKey(keyId: ObjectID): Promise<UserAPIKey> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.GET)
      .withPath(this.getApiKeyRoute(keyId.toHexString()));
    reqBuilder
      .withRefreshToken();
    
    return this.requestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response => {
        return UserAPIKey.readFromAPI(response.body)
      })
      .catch(err => { throw StitchError.wrapDecodingError(err) })
  }

  /**
   * Fetches the user API keys associated with the current user.
   */
  protected fetchApiKeys(): Promise<UserAPIKey[]> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.GET)
      .withPath(this.baseRoute);
    reqBuilder
      .withRefreshToken();
    
    return this.requestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response => {
        if(Array.isArray(response.body)) {
          const keys = Array.from(response.body)
          return keys.map(value => UserAPIKey.readFromAPI(value))
        }

        throw new StitchRequestException(
          new Error("unexpected non-array response from server"), 
          StitchRequestErrorCode.DECODING_ERROR
        )
      })
      .catch(err => { throw StitchError.wrapDecodingError(err) })
  }

  /**
   * Deletes a user API key associated with the current user.
   * 
   * @param keyId the id of the API key to delete
   */
  protected deleteApiKey(keyId: ObjectID): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.DELETE)
      .withPath(this.getApiKeyRoute(keyId.toHexString()));
    reqBuilder
      .withRefreshToken();
    
    return this.requestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {})
  }

  /**
   * Enables a user API key associated with the current user.
   * 
   * @param keyId the id of the API key to enable
   */
  protected enableApiKey(keyId: ObjectID): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.PUT)
      .withPath(this.getApiKeyEnableRoute(keyId.toHexString()));
    reqBuilder
      .withRefreshToken();
    
    return this.requestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {})
  }

  /**
   * Disables a user API key associated with the current user.
   * 
   * @param keyId the id of the API key to disable
   */
  protected disableApiKey(keyId: ObjectID): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.PUT)
      .withPath(this.getApiKeyDisableRoute(keyId.toHexString()));
    reqBuilder
      .withRefreshToken();
    
    return this.requestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {})
  }

  private getApiKeyRoute(keyId: string): string {
      return `${this.baseRoute}/${keyId})`
  }

  private getApiKeyEnableRoute(keyId: string): string {
      return `${this.getApiKeyRoute(keyId)}/enable`
  }

  private getApiKeyDisableRoute(keyId: string): string {
    return `${this.getApiKeyRoute(keyId)}/disable`
  }
}
