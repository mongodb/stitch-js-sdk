import CoreStitchUser from "./CoreStitchUser";
import StitchUserProfileImpl from "./StitchUserProfileImpl";
interface StitchUserFactory<T extends CoreStitchUser> {
    makeUser(id: string, loggedInProviderType: string, loggedInProviderName: string, userProfile?: StitchUserProfileImpl): T;
}
export default StitchUserFactory;
