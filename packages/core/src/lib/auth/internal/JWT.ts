import StitchClientException from "../../StitchClientException";

function b64DecodeUnicode(str) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(
    atob(str)
      .split("")
      .map(c => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
}

const EXPIRES = "exp";
const ISSUED_AT = "iat";

/**
 * A simple class representing a JWT issued by the Stitch server. Only contains claims relevant to the SDK.
 */
export default class JWT {
  /**
   * Initializes the `StitchJWT` with a base64-encoded string, with or without padding characters.
   */
  public static fromEncoded(encodedJWT: string): JWT {
    const parts = JWT.splitToken(encodedJWT);
    const json = JSON.parse(b64DecodeUnicode(parts[1]));
    const expires = json[EXPIRES];
    const iat = json[ISSUED_AT];
    return new JWT(expires, iat);
  }

  /**
   * Private utility function to split the JWT into its three constituent parts.
   */
  private static splitToken(jwt: string): string[] {
    const parts = jwt.split(".");
    if (parts.length !== 3) {
      throw new Error(
        `Malformed JWT token. The string ${jwt} should have 3 parts.`
      );
    }
    return parts;
  }

  /**
   * Per RFC 7519:
   * 4.1.4.  "exp" (Expiration Time) Claim
   *
   * The "exp" (expiration time) claim identifies the expiration time on
   * or after which the JWT MUST NOT be accepted for processing.  The
   * processing of the "exp" claim requires that the current date/time
   * MUST be before the expiration date/time listed in the "exp" claim.
   */
  public readonly expires: number;
  /**
   * Per RFC 7519:
   * 4.1.6.  "iat" (Issued At) Claim
   *
   * The "iat" (issued at) claim identifies the time at which the JWT was
   * issued.  This claim can be used to determine the age of the JWT.  Its
   * value MUST be a number containing a NumericDate value.  Use of this
   * claim is OPTIONAL.
   */
  public readonly issuedAt: number;

  private constructor(expires: number, issuedAt: number) {
    this.expires = expires;
    this.issuedAt = issuedAt;
  }
}
