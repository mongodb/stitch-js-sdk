import { Storage } from "../../internal/common/Storage";
import CoreStitchAuth from "./CoreStitchAuth";
import CoreStitchUser from "./CoreStitchUser";
import JWT from "./JWT";

const SLEEP_MILLIS = 60000;
const EXPIRATION_WINDOW_SECS = 300;

/**
 * A class containing functionality to proactively refresh access tokens
 * to prevent the server from getting too many invalid session errors.
 */
export default class AccessTokenRefresher<T extends CoreStitchUser> {
  /**
   * A weak reference to the `CoreStitchAuth` for which this refresher will attempt to refresh tokens.
   */
  public readonly authRef?: CoreStitchAuth<T>;

  constructor(authRef?: CoreStitchAuth<T>) {
    this.authRef = authRef;
  }

  /**
   * Checks if the access token in the `CoreStitchAuth` referenced by `authRef` needs to be refreshed.
   *
   * - returns: false if `authRef` has been deallocated, true otherwise
   */
  public shouldRefresh(): boolean {
    const auth = this.authRef;
    if (auth === undefined) {
      return false;
    }

    if (!auth.isLoggedIn) {
      return false;
    }

    const info = auth.authInfo;
    if (info === undefined) {
      return false;
    }

    let jwt: JWT;
    try {
      jwt = JWT.fromEncoded(info.accessToken!);
    } catch (e) {
      return false;
    }

    // Check if it's time to refresh the access token
    if (Date.now() / 1000 < jwt.expires - EXPIRATION_WINDOW_SECS) {
      return false;
    }

    return true;
  }

  /**
   * Infinitely loops, checking if a proactive token refresh is necessary,
   * every `sleepMillis` milliseconds. If the `CoreStitchAuth` referenced in `
   * authRef` is deallocated, the loop will end.
   */
  public run() {
    if (!this.shouldRefresh()) {
      setTimeout(() => this.run(), SLEEP_MILLIS);
    } else {
      this.authRef!.refreshAccessToken().then(() => {
        setTimeout(() => this.run(), SLEEP_MILLIS);
      });
    }
  }
}
