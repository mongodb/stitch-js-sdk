import StitchUserIdentity from "../StitchUserIdentity";
import CoreStitchUser from "./CoreStitchUser";
import StitchUserProfileImpl from "./StitchUserProfileImpl";
export default class CoreStitchUserImpl implements CoreStitchUser {
    readonly id: string;
    readonly loggedInProviderType: string;
    readonly loggedInProviderName: string;
    readonly profile: StitchUserProfileImpl;
    protected constructor(id: string, loggedInProviderType: string, loggedInProviderName: string, profile?: StitchUserProfileImpl);
    readonly userType: string | undefined;
    readonly identities: StitchUserIdentity[];
}
