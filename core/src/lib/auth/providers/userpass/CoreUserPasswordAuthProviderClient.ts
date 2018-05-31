import Method from "../../../internal/net/Method";
import { StitchDocRequest } from "../../../internal/net/StitchDocRequest";
import StitchRequestClient from "../../../internal/net/StitchRequestClient";
import { StitchAuthRoutes } from "../../internal/StitchAuthRoutes";
import CoreAuthProviderClient from "../internal/CoreAuthProviderClient";
import UserPasswordCredential from "./UserPasswordCredential";
import UserPasswordAuthProvider from "./UserPasswordAuthProvider";

enum RegistrationFields {
  EMAIL = "email",
  PASSWORD = "password"
}

enum ActionFields {
  EMAIL = "email",
  PASSWORD = "password",
  TOKEN = "token",
  TOKEN_ID = "tokenId"
}

export default class CoreUserPasswordAuthProviderClient extends CoreAuthProviderClient<
  StitchRequestClient
> {
  public constructor(
    providerName: string = UserPasswordAuthProvider.DEFAULT_NAME,
    requestClient: StitchRequestClient,
    authRoutes: StitchAuthRoutes
  ) {
    let baseRoute = authRoutes.getAuthProviderRoute(providerName);
    super(providerName, requestClient, baseRoute);
  }

  public registerWithEmailInternal(
    email: string,
    password: string
  ): Promise<void> {
    const reqBuilder = new StitchDocRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.getRegisterWithEmailRoute());
    reqBuilder.withDocument({
      [RegistrationFields.EMAIL]: email,
      [RegistrationFields.PASSWORD]: password
    });
    return this.requestClient.doRequest(reqBuilder.build()).then(() => {});
  }

  protected confirmUserInternal(token: string, tokenId: string): Promise<void> {
    const reqBuilder = new StitchDocRequest.Builder();
    reqBuilder.withMethod(Method.POST).withPath(this.getConfirmUserRoute());
    reqBuilder.withDocument({
      [ActionFields.TOKEN]: token,
      [ActionFields.TOKEN_ID]: tokenId
    });
    return this.requestClient.doRequest(reqBuilder.build()).then(() => {});
  }

  protected resendConfirmationEmailInternal(email: string): Promise<void> {
    const reqBuilder = new StitchDocRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.getResendConfirmationEmailRoute());
    reqBuilder.withDocument({ [ActionFields.EMAIL]: email });
    return this.requestClient.doRequest(reqBuilder.build()).then(() => {});
  }

  protected resetPasswordInternal(
    token: string,
    tokenId: string,
    password: string
  ): Promise<void> {
    const reqBuilder = new StitchDocRequest.Builder();
    reqBuilder.withMethod(Method.POST).withPath(this.getResetPasswordRoute());
    reqBuilder.withDocument({
      [ActionFields.TOKEN]: token,
      [ActionFields.TOKEN_ID]: tokenId,
      [ActionFields.PASSWORD]: password
    });
    return this.requestClient.doRequest(reqBuilder.build()).then(() => {});
  }

  protected sendResetPasswordEmailInternal(email: string): Promise<void> {
    const reqBuilder = new StitchDocRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.getSendResetPasswordEmailRoute());
    reqBuilder.withDocument({ [ActionFields.EMAIL]: email });
    return this.requestClient.doRequest(reqBuilder.build()).then(() => {});
  }

  private getRegisterWithEmailRoute(): string {
    return this.getExtensionRoute("register");
  }

  private getConfirmUserRoute(): string {
    return this.getExtensionRoute("confirm");
  }

  private getResendConfirmationEmailRoute(): string {
    return this.getExtensionRoute("confirm/send");
  }

  private getResetPasswordRoute(): string {
    return this.getExtensionRoute("reset");
  }

  private getSendResetPasswordEmailRoute(): string {
    return this.getExtensionRoute("reset/send");
  }

  private getExtensionRoute(path: string): string {
    return `${this.baseRoute}/${path}`;
  }
}
