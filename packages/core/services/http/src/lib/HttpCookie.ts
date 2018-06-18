/**
 * Represents a RFC 6265 cookie.
 */
export default class HttpCookie {
  /**
   * Constructs a new fully specified cookie.
   *
   * @param name the name of the cookie.
   * @param value the value of the cookie.
   * @param path the path within the domain to which this cookie belongs.
   * @param domain the domain to which this cookie belongs.
   * @param expires when the cookie expires.
   * @param maxAge how long the cookie can live for.
   * @param secure whether or not this cookie can only be sent to HTTPS servers.
   * @param httpOnly whether or not this cookie can only be read by a server.
   */
  public constructor(
    public readonly name: string,
    public readonly value: string,
    public readonly path?: string,
    public readonly domain?: string,
    public readonly expires?: string,
    public readonly maxAge?: number,
    public readonly secure?: boolean,
    public readonly httpOnly?: boolean
  ) {}
}
