/** HTTP Header definitions and helper methods. */
export default class Headers {
  public static readonly CONTENT_TYPE_CANON = "Content-Type";
  public static readonly CONTENT_TYPE = Headers.CONTENT_TYPE_CANON.toLocaleLowerCase();

  public static readonly AUTHORIZATION_CANON = "Authorization";
  public static readonly AUTHORIZATION = Headers.AUTHORIZATION_CANON.toLocaleLowerCase();

  /**
   * @param value The bearer value
   * @return A standard Authorization Bearer header value.
   */
  public static getAuthorizationBearer(value: string): string {
    return `${Headers.AUTHORIZATION_BEARER} ${value}`;
  }

  private static readonly AUTHORIZATION_BEARER = "Bearer";
}
