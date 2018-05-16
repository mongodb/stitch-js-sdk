import CoreStitchAuth from "./CoreStitchAuth";
import CoreStitchUser from "./CoreStitchUser";
export default class AccessTokenRefresher<T extends CoreStitchUser> {
    readonly authRef?: CoreStitchAuth<T>;
    constructor(authRef?: CoreStitchAuth<T>);
    checkRefresh(): Promise<boolean>;
    run(): Promise<void>;
}
