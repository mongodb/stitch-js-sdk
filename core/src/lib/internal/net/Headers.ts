/** HTTP Header definitions and helper methods. */
export default class Headers {
  public static readonly CONTENT_TYPE = "Content-Type";
  public static readonly AUTHORIZATION = "Authorization";

  /**
   * @param value The bearer value
   * @return A standard Authorization Bearer header value.
   */
  public static getAuthorizationBearer(value: string): string {
    return `${Headers.AUTHORIZATION_BEARER} ${value}`;
  }

  private static readonly AUTHORIZATION_BEARER = "Bearer";
}
