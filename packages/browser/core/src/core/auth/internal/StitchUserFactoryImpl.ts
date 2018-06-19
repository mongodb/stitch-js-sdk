import {
  StitchUserFactory,
  StitchUserProfileImpl
} from "mongodb-stitch-core-sdk";
import StitchUser from "../StitchUser";
import StitchAuthImpl from "./StitchAuthImpl";
import StitchUserImpl from "./StitchUserImpl";

export default class StitchUserFactoryImpl
  implements StitchUserFactory<StitchUser> {
  private readonly auth: StitchAuthImpl;

  public constructor(auth: StitchAuthImpl) {
    this.auth = auth;
  }

  public makeUser(
    id: string,
    loggedInProviderType: string,
    loggedInProviderName: string,
    userProfile: StitchUserProfileImpl
  ): StitchUser {
    return new StitchUserImpl(
      id,
      loggedInProviderType,
      loggedInProviderName,
      userProfile,
      this.auth
    );
  }
}
