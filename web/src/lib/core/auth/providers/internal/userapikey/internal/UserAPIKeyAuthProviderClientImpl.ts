import { CoreUserAPIKeyAuthProviderClient, ProviderTypes } from "stitch-core";
import UserAPIKeyAuthProviderClient from "../UserAPIKeyAuthProviderClient";

export default class UserAPIKeyAuthProviderClientImpl extends CoreUserAPIKeyAuthProviderClient
    implements UserAPIKeyAuthProviderClient {
  public constructor() {
    super(ProviderTypes.USER_API_KEY);
  }
}
