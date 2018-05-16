import { CoreAnonymousAuthProviderClient, ProviderTypes, AnonymousCredential } from "stitch-core";
import AnonymousAuthProviderClient from "../AnonymousAuthProviderClient";

export default class AnonymousAuthProviderClientImpl extends CoreAnonymousAuthProviderClient
    implements AnonymousAuthProviderClient {

  public constructor() {
    super(ProviderTypes.ANON);
  }

  readonly credential = new AnonymousCredential(ProviderTypes.ANON);
}
