import { CoreGoogleAuthProviderClient, ProviderTypes } from "stitch-core";
import GoogleAuthProviderClient from "../GoogleAuthProviderClient";

export default class GoogleAuthProviderClientImpl extends CoreGoogleAuthProviderClient
    implements GoogleAuthProviderClient {
  public constructor() {
    super(ProviderTypes.GOOGLE);
  }
}
