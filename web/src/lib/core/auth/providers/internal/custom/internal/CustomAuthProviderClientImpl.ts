import { CoreCustomAuthProviderClient, ProviderTypes } from "stitch-core";
import CustomAuthProviderClient from "../CustomAuthProviderClient";

export default class CustomAuthProviderClientImpl extends CoreCustomAuthProviderClient
    implements CustomAuthProviderClient {
  public constructor() {
    super(ProviderTypes.CUSTOM);
  }
}
