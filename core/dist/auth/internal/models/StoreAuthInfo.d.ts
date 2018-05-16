import { Storage } from "../../../internal/common/Storage";
import AuthInfo from "../AuthInfo";
import StitchUserProfileImpl from "../StitchUserProfileImpl";
declare function readFromStorage(storage: Storage): AuthInfo | undefined;
declare function writeToStorage(authInfo: AuthInfo, storage: Storage): void;
declare class StoreAuthInfo extends AuthInfo {
    static readonly STORAGE_NAME: string;
    static decode(from: object): StoreAuthInfo;
    constructor(userId: string, deviceId: string, accessToken: string, refreshToken: string, loggedInProviderType: string, loggedInProviderName: string, userProfile: StitchUserProfileImpl);
    encode(): object;
}
export { StoreAuthInfo, readFromStorage, writeToStorage };
