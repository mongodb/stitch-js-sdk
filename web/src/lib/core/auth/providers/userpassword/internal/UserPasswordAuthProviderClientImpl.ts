import {
  CoreUserPassAuthProviderClient,
  StitchRequestClient,
  StitchAuthRoutes,
  UserPasswordAuthProvider
} from "stitch-core";
import { UserPasswordAuthProviderClient } from "../UserPasswordAuthProviderClient";

export default class UserPasswordAuthProviderClientImpl
  extends CoreUserPassAuthProviderClient
  implements UserPasswordAuthProviderClient {
  public constructor(
    requestClient: StitchRequestClient,
    routes: StitchAuthRoutes
  ) {
    super(UserPasswordAuthProvider.DEFAULT_NAME, requestClient, routes);
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
    token: string,
    tokenId: string,
    password: string
  ): Promise<void> {
    return super.resetPasswordInternal(token, tokenId, password);
  }

  public sendResetPasswordEmail(email: string): Promise<void> {
    return super.sendResetPasswordEmailInternal(email);
  }
}
