import { ProviderTypes, CoreServerAPIKeyAuthProviderClient } from "stitch-core";
import ServerAPIKeyAuthProviderClient from "../ServerAPIKeyAuthProviderClient";

export default class ServerAPIKeyAuthProviderClientImpl extends CoreServerAPIKeyAuthProviderClient
    implements ServerAPIKeyAuthProviderClient {
  public constructor() {
    super(ProviderTypes.SERVER_API_KEY);
  }
}
