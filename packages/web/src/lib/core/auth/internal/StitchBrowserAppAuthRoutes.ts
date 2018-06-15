import * as base64 from "Base64";
import { StitchAppAuthRoutes } from "stitch-core";
import StitchRedirectCredential from "../providers/StitchRedirectCredential";

export default class StitchBrowserAppAuthRoutes extends StitchAppAuthRoutes {
  constructor(clientAppId: string, private readonly baseUrl: string) {
    super(clientAppId);
  }

  public getAuthProviderRedirectRoute(
    credential: StitchRedirectCredential,
    redirectUrl: string,
    state: string,
    deviceInfo: Record<string, any>
  ): string {
    return `${this.baseUrl}${this.getAuthProviderLoginRoute(
      credential.providerName
    )}?redirect=${encodeURI(
      redirectUrl
    )}&state=${state}&device=${this.uriEncodeObject(deviceInfo)}`;
  }

  public getAuthProviderLinkRedirectRoute(
    credential: StitchRedirectCredential,
    redirectUrl: string,
    state: string,
    deviceInfo: Record<string, any>
  ): string {
    return `${this.baseUrl}${this.getAuthProviderLoginRoute(
      credential.providerName
    )}?redirect=${encodeURI(
      redirectUrl
    )}&state=${state}&device=${this.uriEncodeObject(
      deviceInfo
    )}&link=true&providerRedirectHeader=true`;
  }

  /**
   * Utility function to encode a JSON object into a valid string that can be
   * inserted in a URI. The object is first stringified, then encoded in base64,
   * and finally encoded via the builtin encodeURIComponent function.
   *
   * @memberof util
   * @param {object} obj The object to encode
   * @returns {string} The encoded object
   */
  private uriEncodeObject(obj: object): string {
    return encodeURIComponent(base64.btoa(JSON.stringify(obj)));
  }
}
