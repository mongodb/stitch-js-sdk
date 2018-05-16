import StitchRequestClient from "../../../internal/net/StitchRequestClient";
import { StitchAuthRoutes } from "../../internal/StitchAuthRoutes";
import CoreAuthProviderClient from "../CoreAuthProviderClient";
import UserPasswordCredential from "./UserPasswordCredential";
export default abstract class CoreUserPasswordAuthProviderClient extends CoreAuthProviderClient {
    protected constructor(providerName: string, requestClient: StitchRequestClient, authRoutes: StitchAuthRoutes);
    getCredential(username: string, password: string): UserPasswordCredential;
    protected registerWithEmailInternal(email: string, password: string): void;
    protected confirmUserInternal(token: string, tokenId: string): void;
    protected resendConfirmationEmailInternal(email: string): void;
    protected resetPasswordInternal(token: string, tokenId: string, password: string): void;
    protected sendResetPasswordEmailInternal(email: string): void;
    private getRegisterWithEmailRoute();
    private getConfirmUserRoute();
    private getResendConfirmationEmailRoute();
    private getResetPasswordRoute();
    private getSendResetPasswordEmailRoute();
    private getExtensionRoute(path);
}
