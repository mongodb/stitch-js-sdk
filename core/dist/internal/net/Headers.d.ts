export default class Headers {
    static readonly CONTENT_TYPE: string;
    static readonly AUTHORIZATION: string;
    static getAuthorizationBearer(value: string): string;
    private static readonly AUTHORIZATION_BEARER;
}
