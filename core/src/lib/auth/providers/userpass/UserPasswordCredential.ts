import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import UserPasswordAuthProvider from "./UserPasswordAuthProvider";

enum Fields {
  USERNAME = "username",
  PASSWORD = "password"
}

export default class UserPasswordCredential implements StitchCredential {
  public providerType = UserPasswordAuthProvider.TYPE;

  public readonly material: { [key: string]: string };

  public readonly providerCapabilities = new ProviderCapabilities(false);

  public constructor(
    public readonly username: string,
    public readonly password: string,
    public readonly providerName: string = UserPasswordAuthProvider.DEFAULT_NAME
  ) {
    this.material = {
      [Fields.USERNAME]: this.username,
      [Fields.PASSWORD]: this.password
    };
  }
}
