import FacebookAuthProviderClient from "../FacebookAuthProviderClient";
import { CoreFacebookAuthProviderClient, ProviderTypes } from "stitch-core";

export default class FacebookAuthProviderClientImpl extends CoreFacebookAuthProviderClient
    implements FacebookAuthProviderClient {
  public constructor() {
    super(ProviderTypes.FACEBOOK);
  }
}
