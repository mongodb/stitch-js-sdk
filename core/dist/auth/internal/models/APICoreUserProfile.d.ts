import StitchUserProfileImpl from "../StitchUserProfileImpl";
export default class APICoreUserProfile extends StitchUserProfileImpl {
    static decodeFrom(body: object): APICoreUserProfile;
    private constructor();
}
