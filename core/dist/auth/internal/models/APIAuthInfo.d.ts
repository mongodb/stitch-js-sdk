import AuthInfo from "../AuthInfo";
export default class APIAuthInfo extends AuthInfo {
    static readFromAPI(body: object): AuthInfo;
    protected constructor(userId: string, deviceId: string, accessToken: string, refreshToken: string);
}
