import { CoreUserPassAuthProviderClient, StitchRequestClient, StitchAuthRoutes, ProviderTypes } from "stitch-core";
import UserPasswordAuthProviderClient from "../UserPasswordAuthProviderClient";

export default class UserPasswordAuthProviderClientImpl extends CoreUserPassAuthProviderClient
    implements UserPasswordAuthProviderClient {

  public constructor(
      requestClient: StitchRequestClient,
      routes: StitchAuthRoutes) {
    super(ProviderTypes.USER_PASS, requestClient, routes);
  }

  public registerWithEmail(email: string, password: string): Promise<void> {
      return super.registerWithEmailInternal(email, password);
  }

  public confirmUser(token: string, tokenId: string): Promise<void> {
    return super.confirmUserInternal(token, tokenId);
  }

  public resendConfirmationEmail(email: string): Promise<void> {
      return super.resendConfirmationEmailInternal(email);
  }

  public resetPassword(
      token: string, tokenId: string, password: string): Promise<void> {
        return super.resetPasswordInternal(token, tokenId, password);
  }

  public sendResetPasswordEmail(email: string): Promise<void> {
    return super.sendResetPasswordEmailInternal(email);
  }
}
