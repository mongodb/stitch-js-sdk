export default class JWT {
    static fromEncoded(encodedJWT: string): JWT;
    private static splitToken(jwt);
    readonly expires: number;
    readonly issuedAt: number;
    private constructor();
}
