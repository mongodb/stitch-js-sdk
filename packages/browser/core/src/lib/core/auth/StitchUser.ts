import { CoreStitchUser, StitchCredential } from "mongodb-stitch-core-sdk";

interface StitchUser extends CoreStitchUser {
  linkWithCredential(credential: StitchCredential): Promise<StitchUser>;
}

export default StitchUser;
