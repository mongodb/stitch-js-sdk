import StitchUserProfileImpl from "../StitchUserProfileImpl";
import StoreStitchUserIdentity from "./StoreStitchUserIdentity";
export default class StoreCoreUserProfile extends StitchUserProfileImpl {
    userType: string;
    data: {
        [key: string]: string;
    };
    identities: StoreStitchUserIdentity[];
}
