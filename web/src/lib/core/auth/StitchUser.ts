import { CoreStitchUser, StitchCredential } from "stitch-core";

interface StitchUser extends CoreStitchUser {
    linkWithCredential(credential: StitchCredential): Promise<StitchUser>;
}

export default StitchUser;
