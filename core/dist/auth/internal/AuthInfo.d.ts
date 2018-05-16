import StitchUserProfileImpl from "./StitchUserProfileImpl";
export default class AuthInfo {
    static empty(): AuthInfo;
    readonly userId?: string;
    readonly deviceId?: string;
    readonly accessToken?: string;
    readonly refreshToken?: string;
    readonly loggedInProviderType?: string;
    readonly loggedInProviderName?: string;
    readonly userProfile?: StitchUserProfileImpl;
    constructor(userId?: string, deviceId?: string, accessToken?: string, refreshToken?: string, loggedInProviderType?: string, loggedInProviderName?: string, userProfile?: StitchUserProfileImpl);
    loggedOut(): AuthInfo;
    merge(newInfo: AuthInfo): AuthInfo;
}
