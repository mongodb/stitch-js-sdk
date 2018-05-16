import StitchUserIdentity from "../StitchUserIdentity";
import StitchUserProfile from "../StitchUserProfile";
export default interface CoreStitchUser {
    readonly id: string;
    readonly loggedInProviderType: string;
    readonly loggedInProviderName: string;
    readonly userType?: string;
    readonly profile: StitchUserProfile;
    readonly identities: StitchUserIdentity[];
}
