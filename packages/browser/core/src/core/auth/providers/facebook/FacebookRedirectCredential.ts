import { FacebookAuthProvider } from "mongodb-stitch-core-sdk";
import StitchRedirectCredential from "../StitchRedirectCredential";

export default class FacebookRedirectCredential
  implements StitchRedirectCredential {
  public constructor(
    public readonly redirectUrl?: string,
    public readonly providerName = FacebookAuthProvider.DEFAULT_NAME,
    public readonly providerType = FacebookAuthProvider.TYPE,
  ) {
  }
}
