import {
  CoreStitchUserImpl,
  StitchCredential,
  StitchUserProfileImpl
} from "stitch-core";
import StitchUser from "../StitchUser";
import StitchAuthImpl from "./StitchAuthImpl";

export default class StitchUserImpl extends CoreStitchUserImpl
  implements StitchUser {
  private readonly auth: StitchAuthImpl;

  public constructor(
    id: string,
    loggedInProviderType: string,
    loggedInProviderName: string,
    profile: StitchUserProfileImpl,
    auth: StitchAuthImpl
  ) {
    super(id, loggedInProviderType, loggedInProviderName, profile);
    this.auth = auth;
  }

  public linkWithCredential(credential: StitchCredential): Promise<StitchUser> {
    return this.auth.linkWithCredential(this, credential);
  }
}
