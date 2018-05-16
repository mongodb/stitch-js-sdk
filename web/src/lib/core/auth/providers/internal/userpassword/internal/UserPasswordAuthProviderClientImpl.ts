import { CoreUserPassAuthProviderClient, StitchRequestClient, StitchAuthRoutes, ProviderTypes } from "stitch-core";
import UserPasswordAuthProviderClient from "../UserPasswordAuthProviderClient";

export default class UserPasswordAuthProviderClientImpl extends CoreUserPassAuthProviderClient
    implements UserPasswordAuthProviderClient {

  public constructor(
      requestClient: StitchRequestClient,
      routes: StitchAuthRoutes) {
    super(ProviderTypes.USER_PASS, requestClient, routes);
  }

  /**
   * Registers a new user with the given email and password.
   *
   * @return A {@link Promise} that completes when registration completes/fails.
   */
  public registerWithEmail(email: string, password: string): Promise<void> {
      return Promise.resolve(this.registerWithEmailInternal(email, password));
  }

  /**
   * Confirms a user with the given token and token id.
   *
   * @return A {@link Promise} that completes when confirmation completes/fails.
   */
  public confirmUser(token: string, tokenId: string): Promise<void> {
    return Promise.resolve(this.confirmUserInternal(token, tokenId));
  }

  /**
   * Resend the confirmation for a user to the given email.
   *
   * @return A {@link Task} that completes when the resend request completes/fails.
   */
  public resendConfirmationEmail(email: string): Promise<void> {
      return Promise.resolve(this.resendConfirmationEmailInternal(email));
  }

  /**
   * Reset the password of a user with the given token, token id, and new password.
   *
   * @return A {@link Task} that completes when the password reset completes/fails.
   */
  public resetPassword(
      token: string, tokenId: string, password: string): Promise<void> {
        return Promise.resolve(this.resetPasswordInternal(token, tokenId, password));
  }

  /**
   * Sends a user a password reset email for the given email.
   *
   * @return A {@link Task} that completes when the reqest request completes/fails.
   */
  public sendResetPasswordEmail(email: string): Promise<void> {
    return Promise.resolve(this.sendResetPasswordEmailInternal(email));
  }
}
